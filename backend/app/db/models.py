from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.db.database import Base

class VideoHistory(Base):
    __tablename__ = "video_history"

    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(String, index=True, nullable=False)
    title = Column(String, nullable=False)
    thumbnail = Column(String, nullable=True)
    language = Column(String, default="en")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
