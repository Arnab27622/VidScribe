import logging
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base

logger = logging.getLogger(__name__)

# Using a local SQLite database file in the backend directory
SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///./vidscribe_history.db"

# Create the async engine
engine = create_async_engine(
    SQLALCHEMY_DATABASE_URL, 
    echo=False, 
    connect_args={"check_same_thread": False} # Needed for SQLite
)

# Create a configured "Session" class
AsyncSessionLocal = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

# Base class for our models
Base = declarative_base()

# Dependency to get the DB session in FastAPI endpoints
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
