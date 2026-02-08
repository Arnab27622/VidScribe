import os
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
REDIS_URL = os.getenv("REDIS_URL")

if not GEMINI_API_KEY or not YOUTUBE_API_KEY:
    raise ValueError("Missing required API keys: GEMINI_API_KEY and YOUTUBE_API_KEY must be set")

if not REDIS_URL:
    logger.warning("REDIS_URL not set - caching will be disabled")

# Rate limiting configuration
RATE_LIMIT_TRANSCRIPT_TIMES = 10
RATE_LIMIT_TRANSCRIPT_SECONDS = 60

# Security configuration - defaults to localhost for development safety
# In production, set CORS_ORIGINS env var to your allowed domains
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
