"""
Main Entry Point for VidScribe Backend.
This file initializes the FastAPI application, sets up security (CORS),
and monitors the app's lifecycle (startup/shutdown).
"""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

import logging

from fastapi_limiter import FastAPILimiter
from app.core import cache
from app.api import api
from app.core.config import CORS_ORIGINS
from app.core.exception_handlers import rate_limit_exceeded_handler


# Configure logging to ensure visibility in Render logs
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger(__name__)


# The 'lifespan' function handles what happens when the app starts and stops
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Handles startup and shutdown logic.
    On startup: Verifies environment variables and connects to Redis.
    On shutdown: Closes the Redis connection safely.
    """
    # Security check: verify required environment variables
    required_env_vars = ["GEMINI_API_KEY", "YOUTUBE_API_KEY", "REDIS_URL"]
    missing_vars = [var for var in required_env_vars if not os.getenv(var)]
    
    if missing_vars:
        logger.error(f"CRITICAL: Missing required environment variables: {', '.join(missing_vars)}")
        # We don't exit to allow the app to show error states, but functionality will be limited
        
    await cache.init_redis()
    if cache.redis_client:
        await FastAPILimiter.init(cache.redis_client)
        logger.info("Rate limiter initialized")
    else:
        logger.warning("Rate limiter NOT initialized - Redis client is missing")
    yield
    await cache.close_redis()


# Initialize the FastAPI App
app = FastAPI(
    title="YouTube Video Summarizer",
    description="Fetches YouTube Video and generates structured summaries using Gemini AI",
    version="1.0.0",
    lifespan=lifespan,
)

# Setup CORS (Cross-Origin Resource Sharing)
# This allows our React/Next.js frontend to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Accept", "Authorization"],
    allow_credentials=False,
)

# Include the routes from the api module
app.include_router(api.router)

# Register custom error handler for Rate Limiting (429 errors)
app.add_exception_handler(429, rate_limit_exceeded_handler)

# Register custom error handler for Pydantic Validation errors (422)
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Normalizes Pydantic array errors into a single, clean human-readable string.
    This prevents the React frontend from crashing due to unexpected object structures.
    """
    errors = exc.errors()
    if errors:
        first_error = errors[0]
        # Filter out "body" from the location path to make it cleaner
        loc = ".".join([str(x) for x in first_error.get("loc", []) if str(x) != "body"])
        msg = first_error.get("msg", "Validation error")
        detail = f"{loc}: {msg}" if loc else msg
    else:
        detail = "Invalid request format"
        
    return JSONResponse(
        status_code=422,
        content={"detail": detail}
    )

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)  # nosec B104
