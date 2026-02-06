import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
REDIS_URL = os.getenv("REDIS_URL")

if not GEMINI_API_KEY or not YOUTUBE_API_KEY:
    raise ValueError("Missing required API keys")

# Rate limiting configuration
# Rate limiting configuration
# Rate limiting configuration
RATE_LIMIT_TRANSCRIPT_TIMES = 10
RATE_LIMIT_TRANSCRIPT_SECONDS = 60

# Security configuration
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")
