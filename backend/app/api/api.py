"""
API Route Handlers.
This is where the main 'work' happens:
1. Receives video IDs from the frontend.
2. Fetches transcripts from YouTube.
3. Fetches metadata (title, etc.) from YouTube.
4. Sends everything to Gemini AI for summarization.
5. Returns a structured JSON response.
"""
import logging
import os
from fastapi import Depends, APIRouter, HTTPException, Query
from fastapi_limiter.depends import RateLimiter
from fastapi.concurrency import run_in_threadpool
import asyncio
from youtube_transcript_api import NoTranscriptFound
from app.core.cache import get_cached_or_fetch
from app.services.youtube import get_video_metadata, get_safe_metadata
from app.services.gemini import generate_structured_summary, chat_with_video, generate_summary_from_audio
from app.services.audio import download_audio, cleanup_audio
from app.utils.helpers import validate_video_id, format_transcript
from app.core.config import RATE_LIMIT_TRANSCRIPT_TIMES, RATE_LIMIT_TRANSCRIPT_SECONDS
from app.db import crud
from pydantic import BaseModel, EmailStr, Field
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError

logger = logging.getLogger(__name__)

router = APIRouter()
security = HTTPBearer()

JWT_SECRET = os.getenv("JWT_SECRET", "super_secret_key_change_me_in_prod")
ALGORITHM = "HS256"

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """
    Verifies the JWT token and returns the user_id.
    """
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[ALGORITHM])
        user_id_raw = payload.get("sub")
        if not user_id_raw:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        user_id: str = str(user_id_raw)

            
        # Fire-and-forget sync to ensure the user exists in our DB
        name = payload.get("name")
        email = payload.get("email")
        picture = payload.get("picture")
        asyncio.create_task(crud.upsert_user(user_id, name, email, picture))
        
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")


async def fetch_youtube_transcript(video_id: str, lang: str = "en") -> tuple[list[dict], str]:
    """
    Directly interacts with the 'youtube_transcript_api' library.
    Tries to find the requested language, or falls back to English/Auto.
    """
    max_retries = 3
    cookies_path = os.path.join(os.getcwd(), "youtube_cookies.txt")
    
    for attempt in range(max_retries):
        try:
            # Manually handle cookies since the library version has them disabled
            session = None
            if os.path.exists(cookies_path):
                logger.info(f"Loading cookies from {cookies_path}")
                import requests
                from http.cookiejar import MozillaCookieJar
                
                session = requests.Session()
                cj = MozillaCookieJar(cookies_path)
                try:
                    cj.load(ignore_discard=True, ignore_expires=True)
                    session.cookies = cj  # type: ignore
                    logger.info("Cookies loaded successfully into session")
                except Exception as e:
                    logger.error(f"Failed to load cookies: {e}")
                    session = None

            # Initialize the API with our custom session if we have one
            from youtube_transcript_api import YouTubeTranscriptApi
            ytt_api = YouTubeTranscriptApi(http_client=session)
            
            # Use the instance method 'list' instead of class method 'list_transcripts'
            transcript_list = await run_in_threadpool(ytt_api.list, video_id)
            
            if lang == "auto":
                try:
                    # Try English first (manual then auto-generated)
                    transcript_obj = transcript_list.find_transcript(["en"])
                except NoTranscriptFound:
                    # Fallback to the first available transcript
                    transcript_obj = next(iter(transcript_list))
            else:
                transcript_obj = transcript_list.find_transcript([lang])
                
            # Fetch the raw content
            raw_data = await run_in_threadpool(transcript_obj.fetch)
            
            # CRITICAL: Ensure we have plain dictionaries for JSON serialization
            clean_data = []
            for seg in raw_data:
                # Handle both dict-like and object-like segments
                if isinstance(seg, dict):
                    text = seg.get("text", "")
                    start = seg.get("start", 0.0)
                    duration = seg.get("duration", 0.0)
                else:
                    text = getattr(seg, "text", getattr(seg, "__getitem__", lambda x: "")("text"))
                    start = getattr(seg, "start", getattr(seg, "__getitem__", lambda x: 0.0)("start"))
                    duration = getattr(seg, "duration", getattr(seg, "__getitem__", lambda x: 0.0)("duration"))
                
                clean_data.append({
                    "text": str(text),
                    "start": float(start),
                    "duration": float(duration)
                })
            
            return clean_data, str(transcript_obj.language_code)
        except Exception as e:
            if attempt == max_retries - 1:
                logger.warning(f"Transcript fetch failed for video {video_id}: {str(e)}")
                raise HTTPException(
                    status_code=404, detail="Transcript unavailable for this video"
                )
        await asyncio.sleep(1)
    
    raise HTTPException(status_code=404, detail="Transcript unavailable for this video")


async def _process_audio_fallback(video_id: str, target_lang: str, metadata: dict) -> tuple[dict, list]:
    """Helper to download and process audio when transcript is missing."""
    audio_path = await get_cached_or_fetch(
        f"audio_dl:{video_id}",
        lambda v_id: __import__('asyncio').to_thread(download_audio, v_id),
        video_id,
        ttl=3600
    )
    
    if not audio_path:
        raise HTTPException(status_code=404, detail="No transcript available and audio download failed.")
        
    structured_data = await get_cached_or_fetch(
        f"summary_audio:{video_id}:{target_lang}",
        generate_summary_from_audio,
        audio_path,
        metadata.get("description", ""),
        target_lang,
        ttl=86400,
    )
    
    transcript_data = [{"start": 0, "duration": 0, "text": "Transcript not available. Summary generated from audio."}]
    __import__('asyncio').create_task(__import__('asyncio').to_thread(cleanup_audio, audio_path))
    
    return structured_data, transcript_data

@router.get(
    "/transcript/{video_id}",
    dependencies=[
        Depends(
            RateLimiter(
                times=RATE_LIMIT_TRANSCRIPT_TIMES, seconds=RATE_LIMIT_TRANSCRIPT_SECONDS
            )
        )
    ],
)
async def get_structured_transcript(
    video_id: str, 
    lang: str = Query("auto", description="Transcript language code. Use 'auto' for detection."),
    target_lang: str = Query("English", description="Language for the generated summary."),
    user_id: str = Depends(get_current_user)
):
    """
    The main endpoint: GET /transcript/{video_id}
    Orchestrates the entire analysis process.
    """
    try:
        validate_video_id(video_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    try:
        metadata = await get_video_metadata(video_id) or {}
        safe_metadata = get_safe_metadata(video_id, metadata)

        # Use a special cache key for auto to store the resolved data
        transcript_str = ""
        structured_data = None
        
        try:
            transcript_data, detected_lang = await get_cached_or_fetch(
                f"transcript:{video_id}:{lang}",
                fetch_youtube_transcript,
                video_id,
                lang,
                ttl=86400,
            )
            
            transcript_str = await __import__('asyncio').to_thread(
                lambda data: "\n".join(f"{seg['start']:.2f}s: {seg['text']}" for seg in data),
                transcript_data
            )
            
            structured_data = await get_cached_or_fetch(
                f"summary:{video_id}:{detected_lang}:{target_lang}",
                generate_structured_summary,
                transcript_str,
                metadata.get("description", ""),
                target_lang,
                ttl=86400,
            )
            
        except (NoTranscriptFound, Exception):
            logger.info(f"No transcript found for {video_id}. Falling back to audio processing.")
            detected_lang = lang if lang != "auto" else "English"
            
            structured_data, transcript_data = await _process_audio_fallback(
                video_id, target_lang, metadata
            )

        formatted_transcript = format_transcript(transcript_data)

        # Save to history database
        thumbnail = safe_metadata["thumbnail"]
        await crud.create_history_record(
            user_id=user_id,
            video_id=video_id,
            title=structured_data.get("title", "Untitled Video"),
            thumbnail=thumbnail,
            language=target_lang,
            full_data=structured_data
        )

        return {
            "video_id": video_id,
            "language": detected_lang,
            "full_transcript": formatted_transcript,
            "total_segments": len(formatted_transcript),
            "metadata": safe_metadata,
            **structured_data,
        }
    except HTTPException:
        raise
    except Exception:
        logger.exception(f"Unexpected error processing video {video_id}")
        raise HTTPException(status_code=500, detail="An error occurred while processing your request")

@router.get("/history")
async def get_recent_summaries(user_id: str = Depends(get_current_user)):
    """Fetches the 10 most recently summarized videos for the user."""
    history = await crud.get_recent_history(user_id=user_id, limit=10)
    return history

class ChatRequest(BaseModel):
    question: str
    lang: str = "auto"

@router.post("/chat/{video_id}")
async def chat_video(video_id: str, request: ChatRequest, user_id: str = Depends(get_current_user)):
    """
    Asks a question to Gemini based on the video transcript (Streams the response).
    """
    try:
        validate_video_id(video_id)
        
        # Try to get the transcript from cache or re-fetch it
        transcript_data, detected_lang = await get_cached_or_fetch(
            f"transcript:{video_id}:{request.lang}",
            fetch_youtube_transcript,
            video_id,
            request.lang,
            ttl=86400,
        )
        
        transcript_str = await __import__('asyncio').to_thread(
            lambda data: "\n".join(f"{seg['start']:.2f}s: {seg['text']}" for seg in data),
            transcript_data
        )
        
        # Stream the response
        return StreamingResponse(
            chat_with_video(transcript_str, request.question),
            media_type="text/event-stream"
        )
        
    except Exception:
        logger.exception(f"Error in chat for video {video_id}")
        raise HTTPException(status_code=500, detail="Failed to process chat question")

# --- Authentication Endpoints ---

class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=50, description="User's full name")
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., min_length=8, description="Password (min 8 characters)")

class UserLogin(BaseModel):
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., min_length=8, description="Password")

@router.post("/auth/register")
async def register(user: UserRegister):
    """
    Registers a new user using email and password.
    """
    email_clean = user.email.lower().strip()
    name_clean = user.name.strip()
    
    new_user = await crud.register_user(
        email=email_clean,
        password=user.password,
        name=name_clean
    )
    
    if not new_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    return {"message": "User created successfully", "id": new_user["_id"]}

@router.post("/auth/login")
async def login(credentials: UserLogin):
    """
    Verifies email and password. Used by NextAuth CredentialsProvider.
    """
    email_clean = credentials.email.lower().strip()
    
    user = await crud.verify_user(email_clean, credentials.password)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    return {
        "id": user["_id"],
        "email": user["email"],
        "name": user.get("name"),
        "picture": user.get("picture")
    }
