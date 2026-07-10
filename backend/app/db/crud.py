from datetime import datetime, timezone
from app.db.database import history_collection, users_collection
import bcrypt
import uuid

from typing import Optional, Dict, Any

async def create_history_record(user_id: str, video_id: str, title: str, thumbnail: str, language: str, full_data: Optional[Dict[str, Any]] = None):
    """
    Creates or updates a history record in MongoDB.
    Associates the record with a specific user_id.
    """
    if history_collection is None:
        return None
        
    doc = {
        "user_id": user_id,
        "video_id": video_id,
        "title": title,
        "thumbnail": thumbnail,
        "language": language,
        "created_at": datetime.now(timezone.utc),
    }
    
    # Store full Gemini response data if provided (nested arrays etc.)
    if full_data:
        # Avoid duplicating large transcript text in history if not needed
        data_to_store = full_data.copy()
        if "full_transcript" in data_to_store:
            del data_to_store["full_transcript"]
        doc["summary_data"] = data_to_store

    # Upsert based on user_id, video_id, and language
    await history_collection.update_one(
        {"user_id": user_id, "video_id": video_id, "language": language},
        {"$set": doc},
        upsert=True
    )
    return doc

async def get_recent_history(user_id: str, limit: int = 20):
    """
    Fetches the most recently summarized videos for a specific user.
    """
    if history_collection is None:
        return []
        
    cursor = history_collection.find({"user_id": user_id}).sort("created_at", -1).limit(limit)
    records = await cursor.to_list(length=limit)
    
    # MongoDB returns _id as ObjectId which is not JSON serializable directly by FastAPI unless handled
    # We'll just convert it to string
    for r in records:
        r["_id"] = str(r["_id"])
        
    return records

async def upsert_user(user_id: str, name: Optional[str] = None, email: Optional[str] = None, picture: Optional[str] = None):
    """
    Creates or updates a user record in MongoDB based on JWT info.
    """
    if users_collection is None:
        return None
        
    update_data: Dict[str, Any] = {
        "last_login": datetime.now(timezone.utc)
    }
    
    if name:
        update_data["name"] = name
    if email:
        update_data["email"] = email
    if picture:
        update_data["picture"] = picture
        
    await users_collection.update_one(
        {"_id": user_id},
        {
            "$set": update_data,
            "$setOnInsert": {"created_at": datetime.now(timezone.utc)}
        },
        upsert=True
    )

async def register_user(email: str, password: str, name: Optional[str] = None):
    """
    Registers a new user with an email and hashed password.
    Returns the user document, or None if the email already exists.
    """
    if users_collection is None:
        return None
        
    existing_user = await users_collection.find_one({"email": email})
    if existing_user:
        return None  # Email already exists
        
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    user_id = str(uuid.uuid4())
    
    new_user = {
        "_id": user_id,
        "email": email,
        "name": name,
        "password_hash": hashed_password,
        "auth_provider": "local",
        "created_at": datetime.now(timezone.utc),
        "last_login": datetime.now(timezone.utc)
    }
    
    await users_collection.insert_one(new_user)
    return new_user

async def verify_user(email: str, password: str):
    """
    Verifies a user's password.
    Returns the user document if valid, otherwise None.
    """
    if users_collection is None:
        return None
        
    user = await users_collection.find_one({"email": email, "auth_provider": "local"})
    if not user:
        return None
        
    if bcrypt.checkpw(password.encode('utf-8'), user["password_hash"].encode('utf-8')):
        # Update last login
        await users_collection.update_one(
            {"_id": user["_id"]},
            {"$set": {"last_login": datetime.now(timezone.utc)}}
        )
        return user
        
    return None
