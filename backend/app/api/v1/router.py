"""
API v1 Router

Aggregates all v1 API endpoints.
"""

from fastapi import APIRouter
from app.api.v1.endpoints import auth, health, land

# Create main v1 router
router = APIRouter()

# Include all endpoint routers
router.include_router(health.router, tags=["health"])
router.include_router(auth.router, prefix="/auth", tags=["authentication"])
router.include_router(land.router, prefix="/land", tags=["land"])

# Add more endpoint routers here as the API grows
# router.include_router(properties.router, prefix="/properties", tags=["properties"])
# router.include_router(transactions.router, prefix="/transactions", tags=["transactions"])
