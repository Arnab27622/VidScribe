from typing import Dict, Any, List, Tuple
from app.services.extractors.base import IVideoExtractor
from app.services.youtube import get_video_metadata

class YTDLPExtractor(IVideoExtractor):
    """
    Extractor implementation using yt-dlp for metadata and fallback transcript extraction.
    Currently wraps existing functionality.
    """
    
    async def get_metadata(self, video_id: str) -> Dict[str, Any]:
        """Uses yt-dlp to fetch video metadata."""
        metadata = await get_video_metadata(video_id)
        if not metadata:
            return {}
        return metadata

    async def get_transcript(self, video_id: str, lang: str = "auto") -> Tuple[List[Dict[str, Any]], str]:
        """
        Ideally yt-dlp could extract subtitles, but for now we delegate this 
        to the specialized transcript API.
        """
        # In a full implementation, this could call yt-dlp's subtitle extractors
        raise NotImplementedError("yt-dlp transcript extraction not fully implemented here yet.")
