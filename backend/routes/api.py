from fastapi import Depends, APIRouter, HTTPException, Query
from fastapi_limiter.depends import RateLimiter
from fastapi.concurrency import run_in_threadpool
import asyncio
from youtube_transcript_api import YouTubeTranscriptApi, NoTranscriptFound
from cache import get_cached_or_fetch
from services.youtube import get_video_metadata, get_safe_metadata
from services.gemini import generate_structured_summary
from utils import validate_video_id, format_transcript
from config import RATE_LIMIT_TRANSCRIPT_TIMES, RATE_LIMIT_TRANSCRIPT_SECONDS

router = APIRouter()

SUPPORTED_LANGS = ["en", "es", "fr", "de", "hi", "ja"]


async def fetch_youtube_transcript(video_id: str, lang: str = "en") -> list[dict]:
    max_retries = 3

    for attempt in range(max_retries):
        try:
            return await run_in_threadpool(
                YouTubeTranscriptApi.get_transcript, video_id, languages=[lang]
            )
        except NoTranscriptFound as e:
            if attempt == max_retries - 1:
                raise HTTPException(
                    status_code=404,
                    detail="No transcript available in selected language",
                )
        except Exception as e:
            if attempt == max_retries - 1:
                raise HTTPException(
                    status_code=404, detail=f"Transcript unavailable: {str(e)}"
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
    video_id: str, lang: str = Query("en", description="Transcript language code")
):
    try:
        validate_video_id(video_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if lang not in SUPPORTED_LANGS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported language. Supported: {', '.join(SUPPORTED_LANGS)}",
        )

    try:
        transcript = await get_cached_or_fetch(
            f"transcript:{video_id}:{lang}",
            fetch_youtube_transcript,
            video_id,
            lang,
            ttl=86400,
        )

        metadata = await get_video_metadata(video_id) or {}
        safe_metadata = get_safe_metadata(video_id, metadata)

        transcript_str = "\n".join(
            f"{seg['start']:.2f}s: {seg['text']}" for seg in transcript
        )

        structured_data = await get_cached_or_fetch(
            f"summary:{video_id}:{lang}",
            generate_structured_summary,
            transcript_str,
            ttl=86400,
        )

        formatted_transcript = format_transcript(transcript)

        return {
            "video_id": video_id,
            "language": lang,
            "full_transcript": formatted_transcript,
            "total_segments": len(formatted_transcript),
            "metadata": safe_metadata,
            **structured_data,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")
