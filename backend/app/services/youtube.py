import logging
import httpx
from app.core.config import YOUTUBE_API_KEY
from app.utils.helpers import iso8601_to_seconds

logger = logging.getLogger(__name__)


async def get_video_metadata(video_id: str) -> dict:
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                "https://www.googleapis.com/youtube/v3/videos",
                params={
                    "part": "snippet,contentDetails,status",
                    "id": video_id,
                    "key": YOUTUBE_API_KEY,
                },
            )

        if response.status_code != 200:
            if response.status_code == 403:
                logger.error("YouTube API quota exceeded or key invalid")
            logger.warning(f"YouTube API returned status {response.status_code} for video {video_id}")
            return {}

        data = response.json()
        if not data.get("items"):
            logger.info(f"No metadata found for video {video_id} (might be private or deleted)")
            return {}

        item = data["items"][0]
        
        # Check if video is embeddable or has restrictions
        status = item.get("status", {})
        if not status.get("embeddable", True):
            logger.info(f"Video {video_id} is not embeddable")

        duration_iso = item["contentDetails"]["duration"]
        duration_seconds = iso8601_to_seconds(duration_iso)

        return {
            "channel": item["snippet"]["channelTitle"],
            "duration_seconds": duration_seconds,
            "published_at": item["snippet"]["publishedAt"],
            "title": item["snippet"]["title"],
            "description": item["snippet"].get("description", ""),
            "thumbnail": item["snippet"]["thumbnails"].get("maxres", item["snippet"]["thumbnails"].get("high", item["snippet"]["thumbnails"].get("default")))["url"],
            "is_embeddable": status.get("embeddable", True)
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
        "description": metadata.get("description", ""),
        "thumbnail": metadata.get(
            "thumbnail", f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg"
        ),
        "is_embeddable": metadata.get("is_embeddable", True)
    }

