import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from fastapi_limiter import FastAPILimiter
import cache
from routes import api
from config import CORS_ORIGINS
from exception_handlers import rate_limit_exceeded_handler


import logging

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await cache.init_redis()
    if cache.redis_client:
        await FastAPILimiter.init(cache.redis_client)
        logger.info("Rate limiter initialized")
    else:
        logger.warning("Rate limiter NOT initialized - Redis client is missing")
    yield
    await cache.close_redis()


app = FastAPI(
    title="YouTube Video Summarizer",
    description="Fetches YouTube Video and generates structured summaries using Gemini AI",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["GET", "OPTIONS"],
    allow_headers=["Content-Type", "Accept"],
    allow_credentials=False,
)

app.include_router(api.router)

app.add_exception_handler(429, rate_limit_exceeded_handler)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
