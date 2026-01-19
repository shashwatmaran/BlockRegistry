"""
API v1 Router

Aggregates all v1 API endpoints.
"""

from fastapi import APIRouter
from app.api.v1.endpoints import health, auth, land, users

# Create main v1 router
router = APIRouter()

# Include all sub-routers
router.include_router(health.router, tags=["health"])
router.include_router(auth.router, prefix="/auth", tags=["authentication"])
router.include_router(land.router, prefix="/land", tags=["land"])
router.include_router(users.router, prefix="/users", tags=["users"])

# Add more endpoint routers here as the API grows
# router.include_router(properties.router, prefix="/properties", tags=["properties"])
# router.include_router(transactions.router, prefix="/transactions", tags=["transactions"])
