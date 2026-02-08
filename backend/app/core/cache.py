"""
Redis Caching Module.
Implements the 'Get or Fetch' pattern to reduce API costs and improve speed.
"""
import json
import logging
import redis.asyncio as redis
from app.core.config import REDIS_URL

logger = logging.getLogger(__name__)

redis_client = None


async def init_redis():
    """Establishes connection to the Redis server for caching."""
    global redis_client
    if not REDIS_URL:
        logger.warning("Redis URL not configured - caching disabled")
        return
    try:
        redis_client = redis.from_url(REDIS_URL, encoding="utf-8", decode_responses=True)
        # Test connection
        await redis_client.ping()
        logger.info("Redis connection established successfully")
    except Exception as e:
        logger.error(f"Failed to connect to Redis: {e}")
        redis_client = None


async def close_redis():
    global redis_client
    if redis_client:
        await redis_client.close()
        logger.info("Redis connection closed")


async def get_cached_or_fetch(cache_key, fetch_function, *args, ttl=3600):
    """
    Checks Redis for a key. If found, returns it. 
    If NOT found, runs 'fetch_function', saves the result to Redis, and returns it.
    """
    if redis_client:
        try:
            cached = await redis_client.get(cache_key)
            if cached:
                logger.debug(f"Cache hit for key: {cache_key}")
                return json.loads(cached)
        except (UnicodeDecodeError, json.JSONDecodeError):
            # Old pickle data or corrupted cache - delete and re-fetch
            logger.warning(f"Corrupted cache entry for key: {cache_key}, deleting")
            await redis_client.delete(cache_key)
        except Exception as e:
            logger.warning(f"Redis get failed, proceeding without cache: {e}")

    # Execute the fetch function (it must be async)
    result = await fetch_function(*args)

    if redis_client:
        try:
            await redis_client.setex(cache_key, ttl, json.dumps(result))
            logger.debug(f"Cached result for key: {cache_key}")
        except Exception as e:
            logger.warning(f"Failed to cache result: {e}")

    return result
