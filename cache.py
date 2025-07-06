import pickle
import redis
from config import REDIS_URL

redis_client = redis.Redis.from_url(REDIS_URL)


def get_cached_or_fetch(cache_key, fetch_function, *args, ttl=3600):
    cached = redis_client.get(cache_key)
    if cached:
        return pickle.loads(cached)

    result = fetch_function(*args)
    redis_client.setex(cache_key, ttl, pickle.dumps(result))
    return result
