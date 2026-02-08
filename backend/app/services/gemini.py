"""
Google Gemini AI Service.
Handles the interaction with Google's Generative AI to create summaries.
"""
import logging
import google.generativeai as genai
from fastapi import HTTPException
from app.core.config import GEMINI_API_KEY
from app.utils.helpers import parse_gemini_response

logger = logging.getLogger(__name__)

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.5-flash")


async def generate_structured_summary(transcript_str: str, description: str = "") -> dict:
    """
    Sends the video transcript to Gemini AI with a specific 'system prompt'.
    The prompt instructs Gemini to return a very specific JSON structure.
    """
    MAX_TRANSCRIPT_LENGTH = 100000
    if len(transcript_str) > MAX_TRANSCRIPT_LENGTH:
        transcript_str = transcript_str[:MAX_TRANSCRIPT_LENGTH] + "\n[TRUNCATED]"

    # Extract potential chapters from description for context
    chapters_context = ""
    if description:
        chapters_context = f"\nVideo Description/Chapters context:\n{description[:5000]}\n"

    prompt = f"""
    Based on the following YouTube transcription and metadata, generate a professional, high-utility structured summary.
    {chapters_context}
    
    Guidelines:
    - ALWAYS check the provided Video Description/Chapters context first. If the creator has defined chapters or sections, use them to structure your key topics and summary milestones.
    - Focus on the most important 'why' and 'how' from the video.
    - Actionable insights should be practical, specific, and derive directly from the content.
    - Key topics MUST include timestamps and should represent major segments of the video.
    - Ensure the tone is professional, objective, and academic yet accessible.
    
    IMPORTANT: Your response MUST be in ENGLISH regardless of the original video's language.
    If the transcription is in another language, translate and summarize it in English.
    
    Return a JSON object with this structure:
    {{
      "title": "Optimized Video Title in English",
      "summary": "Executive summary of the main content in English (3-5 sentences)",
      "key_topics": [
        {{"topic": "Name of topic/chapter", "timestamp": "Start time in MM:SS format"}},
        {{"topic": "Name of topic/chapter", "timestamp": "Start time in MM:SS format"}}
      ],
      "actionable_insights": [
        "Insight 1: Specific actionable advice with context",
        "Insight 2: Specific actionable advice with context",
        "Insight 3: Specific actionable advice with context"
      ]
    }}
    
    Return ONLY the JSON object, no other text.
    
    Transcription:
    {transcript_str}
    """

    try:
        response = await model.generate_content_async(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.2,
                response_mime_type="application/json",
            ),
        )
        return parse_gemini_response(response.text)
    except Exception as e:
        logger.exception("Gemini API processing failed")
        raise HTTPException(
            status_code=500, detail="AI summary generation failed. Please try again."
        )

