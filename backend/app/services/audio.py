import os
import yt_dlp
import uuid
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

TEMP_DIR = Path("temp_audio")
TEMP_DIR.mkdir(exist_ok=True)

def download_audio(video_id: str) -> str | None:
    """
    Downloads the audio of a YouTube video using yt-dlp.
    Returns the path to the downloaded audio file or None if it fails.
    """
    url = f"https://www.youtube.com/watch?v={video_id}"
    output_filename = TEMP_DIR / f"{video_id}_{uuid.uuid4().hex[:8]}.%(ext)s"
    
    ydl_opts = {
        'format': 'm4a/bestaudio/best',
        'outtmpl': str(output_filename),
        'quiet': True,
        'no_warnings': True
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:  # type: ignore
            ydl.extract_info(url, download=True)
            # Find whatever file was downloaded since the extension could be .m4a or .webm
            for f in TEMP_DIR.glob(f"{video_id}_*"):
                return str(f)
                
    except Exception as e:
        logger.error(f"Failed to download audio for {video_id}: {e}")
        return None
    
    return None

def cleanup_audio(filepath: str):
    """Deletes the temporary audio file."""
    try:
        if filepath and os.path.exists(filepath):
            os.remove(filepath)
    except Exception as e:
        logger.error(f"Failed to cleanup {filepath}: {e}")
