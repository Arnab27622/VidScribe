from typing import Dict, Any, List, Tuple
from app.services.extractors.base import IVideoExtractor
from app.api.api import fetch_youtube_transcript

class YouTubeTranscriptAPIAdapter(IVideoExtractor):
    """
    Adapter for youtube-transcript-api.
    Specializes in extracting transcripts.
    """
    
    async def get_metadata(self, video_id: str) -> Dict[str, Any]:
        """
        youtube-transcript-api does not extract metadata.
        """
        raise NotImplementedError("youtube-transcript-api does not extract metadata.")

    async def get_transcript(self, video_id: str, lang: str = "auto") -> Tuple[List[Dict[str, Any]], str]:
        """Uses youtube-transcript-api to fetch the transcript."""
        return await fetch_youtube_transcript(video_id, lang)
