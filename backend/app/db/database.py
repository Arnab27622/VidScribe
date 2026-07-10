import os
import logging
from typing import Optional, Any
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase, AsyncIOMotorCollection
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")

client: Optional[AsyncIOMotorClient[Any]] = None
db: Optional[AsyncIOMotorDatabase[Any]] = None
history_collection: Optional[AsyncIOMotorCollection[Any]] = None
users_collection: Optional[AsyncIOMotorCollection[Any]] = None

try:
    client = AsyncIOMotorClient(MONGO_URI)
    db = client["vidscribe"]
    history_collection = db["history"]
    users_collection = db["users"]
    logger.info("Connected to MongoDB successfully")
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {e}")
    db = None
    history_collection = None
    users_collection = None

async def get_db() -> Optional[AsyncIOMotorDatabase[Any]]:
    return db
