import json
import redis.asyncio as redis
from config import REDIS_URL

redis_client = None


async def init_redis():
    global redis_client
    redis_client = redis.from_url(REDIS_URL, encoding="utf-8", decode_responses=True)


async def close_redis():
    global redis_client
    if redis_client:
        await redis_client.close()


async def get_cached_or_fetch(cache_key, fetch_function, *args, ttl=3600):
    if redis_client:
        try:
            cached = await redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
        except (UnicodeDecodeError, json.JSONDecodeError):
            # Old pickle data or corrupted cache - delete and re-fetch
            await redis_client.delete(cache_key)

    # Execute the fetch function (it must be async)
    result = await fetch_function(*args)

    if redis_client:
        await redis_client.setex(cache_key, ttl, json.dumps(result))

    return result
