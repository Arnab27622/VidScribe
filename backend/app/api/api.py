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
from fastapi import Depends, APIRouter, HTTPException, Query
from fastapi_limiter.depends import RateLimiter
from fastapi.concurrency import run_in_threadpool
import asyncio
from youtube_transcript_api import YouTubeTranscriptApi, NoTranscriptFound
from app.core.cache import get_cached_or_fetch
from app.services.youtube import get_video_metadata, get_safe_metadata
from app.services.gemini import generate_structured_summary
from app.utils.helpers import validate_video_id, format_transcript
from app.core.config import RATE_LIMIT_TRANSCRIPT_TIMES, RATE_LIMIT_TRANSCRIPT_SECONDS

logger = logging.getLogger(__name__)

router = APIRouter()


async def fetch_youtube_transcript(video_id: str, lang: str = "en") -> tuple[list[dict], str]:
    """
    Directly interacts with the 'youtube_transcript_api' library.
    Tries to find the requested language, or falls back to English/Auto.
    """
    max_retries = 3
    for attempt in range(max_retries):
        try:
            transcript_list = await run_in_threadpool(
                YouTubeTranscriptApi.list_transcripts, video_id
            )
            
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
    video_id: str, lang: str = Query("auto", description="Transcript language code. Use 'auto' for detection.")
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
        # Use a special cache key for auto to store the resolved data
        transcript_data, detected_lang = await get_cached_or_fetch(
            f"transcript:{video_id}:{lang}",
            fetch_youtube_transcript,
            video_id,
            lang,
            ttl=86400,
        )

        metadata = await get_video_metadata(video_id) or {}
        safe_metadata = get_safe_metadata(video_id, metadata)

        transcript_str = "\n".join(
            f"{seg['start']:.2f}s: {seg['text']}" for seg in transcript_data
        )

        structured_data = await get_cached_or_fetch(
            f"summary:{video_id}:{detected_lang}",
            generate_structured_summary,
            transcript_str,
            metadata.get("description", ""),
            ttl=86400,
        )

        formatted_transcript = format_transcript(transcript_data)

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
    except Exception as e:
        logger.exception(f"Unexpected error processing video {video_id}")
        raise HTTPException(status_code=500, detail="An error occurred while processing your request")
