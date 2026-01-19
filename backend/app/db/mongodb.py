"""
MongoDB Connection Management

This module handles the MongoDB database connection lifecycle.
"""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class Database:
    """Database connection manager"""
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None


# Global database instance
database = Database()


async def get_database() -> AsyncIOMotorDatabase:
    """
    Dependency to inject database into routes
    
    Returns:
        The MongoDB database instance
    """
    return database.db


async def connect_to_mongo() -> None:
    """
    Connect to MongoDB on application startup
    
    This function is called once when the application starts.
    It initializes the MongoDB client and database connection.
    """
    try:
        logger.info("Connecting to MongoDB...")
        import certifi
        database.client = AsyncIOMotorClient(
            settings.MONGO_URL,
            tlsCAFile=certifi.where()
        )
        database.db = database.client[settings.DB_NAME]
        
        # Verify connection
        await database.client.admin.command('ping')
        logger.info(f"Successfully connected to MongoDB database: {settings.DB_NAME}")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise


async def close_mongo_connection() -> None:
    """
    Close MongoDB connection on application shutdown
    
    This function is called once when the application shuts down.
    """
    try:
        logger.info("Closing MongoDB connection...")
        if database.client:
            database.client.close()
        logger.info("MongoDB connection closed")
    except Exception as e:
        logger.error(f"Error closing MongoDB connection: {e}")
        raise
