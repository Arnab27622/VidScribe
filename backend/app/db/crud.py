from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
from app.db import models
from datetime import datetime, timezone

async def create_history_record(db: AsyncSession, video_id: str, title: str, thumbnail: str, language: str):
    """
    Creates a new history record. If it already exists, ignores.
    """
    # Check if exists for this specific language
    result = await db.execute(
        select(models.VideoHistory)
        .where(models.VideoHistory.video_id == video_id)
        .where(models.VideoHistory.language == language)
    )
    existing = result.scalars().first()
    
    if existing:
        existing.language = language
        existing.created_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(existing)
        return existing
        
    db_record = models.VideoHistory(
        video_id=video_id,
        title=title,
        thumbnail=thumbnail,
        language=language
    )
    db.add(db_record)
    await db.commit()
    await db.refresh(db_record)
    return db_record

async def get_recent_history(db: AsyncSession, limit: int = 20):
    """
    Fetches the most recently summarized videos.
    """
    result = await db.execute(
        select(models.VideoHistory)
        .order_by(desc(models.VideoHistory.created_at))
        .limit(limit)
    )
    return result.scalars().all()
