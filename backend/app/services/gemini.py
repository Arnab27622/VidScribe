"""
Google Gemini AI Service.
Handles the interaction with Google's Generative AI to create summaries.
"""

import logging
import json
import google.generativeai as genai
from fastapi import HTTPException
from app.core.config import GEMINI_API_KEY

logger = logging.getLogger(__name__)

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-3.1-flash-lite")


async def generate_structured_summary(
    transcript_str: str, description: str = "", target_lang: str = "English"
) -> dict:
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
        chapters_context = (
            f"\nVideo Description/Chapters context:\n{description[:5000]}\n"
        )

    prompt = f"""
    Based on the following YouTube transcription and metadata, generate a professional, high-utility structured summary.
    {chapters_context}
    
    Guidelines:
    - ALWAYS check the provided Video Description/Chapters context first. If the creator has defined chapters or sections, use them to structure your key topics and summary milestones.
    - Focus on the most important 'why' and 'how' from the video.
    - Actionable insights should be practical, specific, and derive directly from the content.
    - Key topics MUST include timestamps and should represent major segments of the video.
    - Ensure the tone is professional, objective, and academic yet accessible.
    
    IMPORTANT: Your response MUST be written fluently in {target_lang}.
    Translate all concepts accurately into {target_lang}.
    
    Return a JSON object with this structure:
    {{
      "title": "Optimized Video Title in {target_lang}",
      "summary": "Executive summary of the main content in {target_lang} (3-5 sentences)",
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
        response = await model.generate_content_async(prompt)
        text = response.text
        
        # Simple extraction of the JSON block if it's wrapped in markdown
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
            
        return json.loads(text)
    except Exception as e:
        logger.error(f"Gemini API Error: {str(e)}")
        raise HTTPException(
            status_code=500, detail="AI summary generation failed. Please try again."
        )

async def generate_summary_from_audio(filepath: str, description: str = "", target_lang: str = "English") -> dict:
    """
    Uploads audio to Gemini and generates a structured summary.
    """
    try:
        audio_file = genai.upload_file(filepath)
        
        prompt = f"""
        You are an expert content analyzer. You are provided with the audio track of a YouTube video.
        
        Video Description:
        {description}
        
        Analyze the audio and generate a comprehensive summary.
        - The summary MUST accurately reflect the video's content based on the audio.
        - Create 3-5 Actionable Insights that viewers can apply.
        - Key topics MUST include timestamps and should represent major segments of the video.
        - Ensure the tone is professional, objective, and academic yet accessible.
        
        IMPORTANT: Your response MUST be written fluently in {target_lang}.
        Translate all concepts accurately into {target_lang}.
        
        Return a JSON object with this structure:
        {{
          "title": "Optimized Video Title in {target_lang}",
          "summary": "Executive summary of the main content in {target_lang} (3-5 sentences)",
          "key_topics": [
            {{"topic": "Name of topic/chapter", "timestamp": "Start time in MM:SS format"}},
            {{"topic": "Name of topic/chapter", "timestamp": "Start time in MM:SS format"}}
          ],
          "actionable_insights": [
            "Insight 1 in {target_lang}",
            "Insight 2 in {target_lang}",
            "Insight 3 in {target_lang}"
          ]
        }}
        """
        response = await model.generate_content_async([prompt, audio_file])
        text = response.text
        
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
            
        return json.loads(text)
    except Exception as e:
        logger.error(f"Gemini API Audio Error: {str(e)}")
        raise HTTPException(
            status_code=500, detail="AI summary generation from audio failed. Please try again."
        )

async def chat_with_video(transcript: str, question: str):
    """
    Answers a user's question based strictly on the provided transcript.
    Yields chunks of text for Server-Sent Events (SSE).
    """
    prompt = f"""
    You are an AI assistant answering questions about a specific YouTube video.
    Use ONLY the provided transcript to answer the question. If the answer is not in the transcript, 
    say "I cannot answer this based on the video content." Do not use outside knowledge.
    
    TRANSCRIPT:
    {transcript[:80000]}
    
    QUESTION: {question}
    """
    try:
        response = await model.generate_content_async(prompt, stream=True)
        async for chunk in response:
            if chunk.text:
                yield chunk.text
    except Exception as e:
        logger.error(f"Gemini Chat API Error: {str(e)}")
        yield "Sorry, I encountered an error while analyzing the video."
