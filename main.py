import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter
from fastapi import Depends
import redis.asyncio as aioredis
from routes import api, ui
from config import REDIS_URL, RATE_LIMITS
from exception_handlers import rate_limit_exceeded_handler


@asynccontextmanager
async def lifespan(app: FastAPI):
    redis_async = aioredis.from_url(REDIS_URL, encoding="utf-8", decode_responses=True)
    await FastAPILimiter.init(redis_async)
    yield


app = FastAPI(
    title="YouTube Video Summarizer",
    description="Fetches YouTube Video and generates structured summaries using Gemini AI",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ui.router)
app.include_router(api.router)
app.mount("/static", StaticFiles(directory="static"), name="static")

app.add_exception_handler(429, rate_limit_exceeded_handler)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
