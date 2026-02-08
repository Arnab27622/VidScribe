import logging
import google.generativeai as genai
from fastapi import HTTPException
from config import GEMINI_API_KEY
from utils import parse_gemini_response

logger = logging.getLogger(__name__)

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.5-flash")


async def generate_structured_summary(transcript_str: str) -> dict:
    MAX_TRANSCRIPT_LENGTH = 100000
    if len(transcript_str) > MAX_TRANSCRIPT_LENGTH:
        transcript_str = transcript_str[:MAX_TRANSCRIPT_LENGTH] + "\n[TRUNCATED]"

    prompt = f"""
    Based on the following YouTube transcription, generate a structured summary.
    IMPORTANT: Your response MUST be in ENGLISH regardless of the original video's language.
    If the transcription is in another language, translate and summarize it in English.
    
    Return a JSON object with this structure:
    {{
      "title": "Generated Video Title in English",
      "summary": "Concise summary of the main content in English",
      "key_topics": ["topic1", "topic2", "topic3"] (in English)
    }}
    
    Return ONLY the JSON object, no other text.
    
    Transcription:
    {transcript_str}
    """

    try:
        response = await model.generate_content_async(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.3,
                response_mime_type="application/json",
            ),
        )
        return parse_gemini_response(response.text)
    except Exception as e:
        logger.exception("Gemini API processing failed")
        raise HTTPException(
            status_code=500, detail="AI summary generation failed. Please try again."
        )

