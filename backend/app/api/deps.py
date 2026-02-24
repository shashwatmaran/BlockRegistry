"""
API Dependencies

Common dependencies used across API endpoints.
"""

from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.db.mongodb import get_database
from app.core.security import decode_access_token
from app.schemas.user import UserInDB

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/access-token")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncIOMotorDatabase = Depends(get_database)
) -> UserInDB:
    """
    Dependency to get the current authenticated user
    
    Args:
        token: JWT token from Authorization header
        db: Database instance
        
    Returns:
        The current user
        
    Raises:
        HTTPException: If credentials are invalid or user not found
    """
    # Decode token
    payload = decode_access_token(token)
    email: Optional[str] = payload.get("sub")
    
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user from database
    user = await db.users.find_one({"email": email})
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Convert ObjectId to string for Pydantic validation
    user["_id"] = str(user["_id"])
    
    return UserInDB(**user)


async def get_current_active_user(
    current_user: UserInDB = Depends(get_current_user)
) -> UserInDB:
    """
    Dependency to get current active user
    
    Args:
        current_user: The current authenticated user
        
    Returns:
        The current active user
        
    Raises:
        HTTPException: If user is inactive
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    return current_user


async def get_current_verifier_or_admin(
    current_user: UserInDB = Depends(get_current_active_user)
) -> UserInDB:
    """
    Dependency for endpoints that require verifier or admin role.

    Raises:
        HTTPException 403: If the user's role is not 'verifier' or 'admin'
    """
    if current_user.role not in ("verifier", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Verifier or admin role required"
        )
    return current_user


async def get_current_admin(
    current_user: UserInDB = Depends(get_current_active_user)
) -> UserInDB:
    """
    Dependency for endpoints that require admin role only.

    Raises:
        HTTPException 403: If the user's role is not 'admin'
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin role required"
        )
    return current_user
