import logging
import httpx
from config import YOUTUBE_API_KEY
from utils import iso8601_to_seconds

logger = logging.getLogger(__name__)


async def get_video_metadata(video_id: str) -> dict:
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                "https://www.googleapis.com/youtube/v3/videos",
                params={
                    "part": "snippet,contentDetails",
                    "id": video_id,
                    "key": YOUTUBE_API_KEY,
                },
            )

        if response.status_code != 200:
            logger.warning(f"YouTube API returned status {response.status_code} for video {video_id}")
            return {}

        data = response.json()
        if not data.get("items"):
            logger.info(f"No metadata found for video {video_id}")
            return {}

        item = data["items"][0]
        duration_iso = item["contentDetails"]["duration"]
        duration_seconds = iso8601_to_seconds(duration_iso)

        return {
            "channel": item["snippet"]["channelTitle"],
            "duration_seconds": duration_seconds,
            "published_at": item["snippet"]["publishedAt"],
            "title": item["snippet"]["title"],
            "thumbnail": item["snippet"]["thumbnails"]["default"]["url"],
        }
    except httpx.TimeoutException:
        logger.warning(f"Timeout fetching metadata for video {video_id}")
        return {}
    except Exception as e:
        logger.warning(f"Error fetching metadata for video {video_id}: {e}")
        return {}


def get_safe_metadata(video_id: str, metadata: dict) -> dict:
    return {
        "duration": metadata.get("duration_seconds", 0),
        "channel": metadata.get("channel", "Unknown Channel"),
        "published_at": metadata.get("published_at", ""),
        "title": metadata.get("title", "Untitled Video"),
        "thumbnail": metadata.get(
            "thumbnail", f"https://img.youtube.com/vi/{video_id}/default.jpg"
        ),
    }

