"""
Utility Helper Functions.
Small, reusable pieces of logic for text parsing, validation, and formatting.
"""
import re
import json


def iso8601_to_seconds(duration: str) -> int:
    """Converts YouTube's ISO 8601 duration (e.g., PT1H2M10S) into total seconds."""
    match = re.match(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", duration)
    if not match:
        return 0

    hours = int(match.group(1)) if match.group(1) else 0
    minutes = int(match.group(2)) if match.group(2) else 0
    seconds = int(match.group(3)) if match.group(3) else 0

    return hours * 3600 + minutes * 60 + seconds


def parse_gemini_response(response_text: str) -> dict:
    """
    Cleans and parses the text response from Gemini AI.
    Sometimes Gemini returns JSON wrapped in markdown blocks (```json ... ```).
    """
    try:
        json_match = re.search(r"```json\n(.*?)\n```", response_text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(1))

        return json.loads(response_text)
    except json.JSONDecodeError:
        try:
            clean_text = response_text.strip()
            start_idx = clean_text.find("{")
            end_idx = clean_text.rfind("}")
            if start_idx != -1 and end_idx != -1:
                return json.loads(clean_text[start_idx : end_idx + 1])
            raise
        except Exception as e:
            raise ValueError(f"Invalid JSON response from Gemini: {str(e)}")


def validate_video_id(video_id: str):
    if not re.match(r"^[a-zA-Z0-9_-]{11}$", video_id):
        raise ValueError("Invalid video ID format")
    return video_id


def format_transcript(transcript: list) -> list:
    return [
        {
            "start": seg["start"],
            "text": seg["text"],
            "duration": seg.get("duration", 0),
        }
        for seg in transcript
    ]
