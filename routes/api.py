from fastapi import Depends, APIRouter, HTTPException, Query
from fastapi_limiter.depends import RateLimiter
import time
import requests
import random
from youtube_transcript_api import (
    YouTubeTranscriptApi,
    NoTranscriptFound,
    VideoUnavailable,
    TooManyRequests,
)
from cache import get_cached_or_fetch
from services.youtube import get_video_metadata, get_safe_metadata
from services.gemini import generate_structured_summary
from utils import validate_video_id, format_transcript

router = APIRouter()

SUPPORTED_LANGS = ["en", "es", "fr", "de", "hi", "ja"]

PROXY_SOURCES = [
    "https://proxylist.geonode.com/api/proxy-list?limit=50&page=1&sort_by=lastChecked&sort_type=desc",
    "https://www.proxy-list.download/api/v1/get?type=http",
    "https://api.proxyscrape.com/v2/?request=getproxies&protocol=http",
]


def get_fresh_proxies():
    """Fetch working free proxies from public APIs"""
    proxies = []
    for source in PROXY_SOURCES:
        try:
            response = requests.get(source, timeout=5)
            if response.status_code == 200:
                if "geonode" in source:
                    # Parse GeoNode format
                    data = response.json()
                    proxies.extend(
                        f"{p['ip']}:{p['port']}"
                        for p in data["data"]
                        if "http" in p["protocols"]
                    )
                else:
                    # Parse other formats
                    proxies.extend(
                        line.strip()
                        for line in response.text.split("\n")
                        if ":" in line and line.strip()
                    )
        except Exception:
            continue

    # Add fallback static proxies in case APIs fail
    if not proxies:
        proxies = ["45.61.187.67:4007", "193.122.71.184:3128", "51.15.242.202:8888"]

    random.shuffle(proxies)
    return proxies


def fetch_youtube_transcript(video_id: str, lang: str = "en") -> list[dict]:
    max_retries = 5  # Increased retries for proxy rotation
    proxies = get_fresh_proxies()

    for attempt in range(max_retries):
        try:
            # Select a random proxy
            proxy = random.choice(proxies)
            proxy_dict = {"http": f"http://{proxy}", "https": f"http://{proxy}"}

            return YouTubeTranscriptApi.get_transcript(
                video_id,
                languages=[lang],
                proxies=proxy_dict,
                timeout=10,  # Fail fast on slow proxies
            )
        except (VideoUnavailable, NoTranscriptFound) as e:
            if attempt == max_retries - 1:
                raise HTTPException(
                    status_code=404,
                    detail="No transcript available in selected language",
                )
        except (TooManyRequests, ConnectionError) as e:
            # Rotate to next proxy on these errors
            if attempt == max_retries - 1:
                raise HTTPException(
                    status_code=429,
                    detail="YouTube is blocking requests. Try again later.",
                )
        except Exception as e:
            if attempt == max_retries - 1:
                raise HTTPException(
                    status_code=500, detail=f"Transcript error: {str(e)}"
                )

        # Exponential backoff before retrying
        time.sleep(1.5**attempt)


@router.get(
    "/transcript/{video_id}", dependencies=[Depends(RateLimiter(times=10, seconds=60))]
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
        transcript = get_cached_or_fetch(
            f"transcript:{video_id}:{lang}",
            fetch_youtube_transcript,
            video_id,
            lang,
            ttl=86400,
        )

        metadata = get_video_metadata(video_id) or {}
        safe_metadata = get_safe_metadata(video_id, metadata)

        transcript_str = "\n".join(
            f"{seg['start']:.2f}s: {seg['text']}" for seg in transcript
        )

        structured_data = get_cached_or_fetch(
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
