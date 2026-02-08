"""
Custom Exception Handlers.
Defines how the API should respond to specific errors (like Rate Limiting).
"""
from fastapi import Request
from fastapi.responses import JSONResponse


async def rate_limit_exceeded_handler(request: Request, exc):
    return JSONResponse(
        status_code=429,
        content={"detail": "Too many requests. Please try again later."},
    )
