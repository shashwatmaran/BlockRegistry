"""
Health Check Endpoints

API endpoints for service health monitoring.
"""

from fastapi import APIRouter, Depends, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Dict

from app.db.mongodb import get_database
from app.core.config import settings

router = APIRouter()


@router.get("/", response_model=Dict[str, str])
async def health_check():
    """
    Basic health check endpoint
    
    Returns service status and version information
    """
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION
    }


@router.get("/db", response_model=Dict[str, str])
async def database_health_check(
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Database health check endpoint
    
    Verifies MongoDB connection is working
    """
    try:
        # Ping the database
        await db.client.admin.command('ping')
        return {
            "status": "healthy",
            "database": "connected",
            "db_name": settings.DB_NAME
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }
