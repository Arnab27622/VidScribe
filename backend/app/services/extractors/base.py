from abc import ABC, abstractmethod
from typing import Dict, Any, List, Tuple

class IVideoExtractor(ABC):
    """
    Abstract Base Class representing a standard interface for extracting 
    information and media from video platforms (e.g., YouTube).
    """

    @abstractmethod
    async def get_metadata(self, video_id: str) -> Dict[str, Any]:
        """
        Fetch metadata for a given video ID.
        Returns a dictionary containing title, description, thumbnail, duration, etc.
        """
        pass

    @abstractmethod
    async def get_transcript(self, video_id: str, lang: str = "auto") -> Tuple[List[Dict[str, Any]], str]:
        """
        Fetch the transcript for a given video ID and language.
        Returns a tuple of (transcript_data, detected_language).
        transcript_data is a list of dictionaries with 'text', 'start', 'duration'.
        """
        pass
