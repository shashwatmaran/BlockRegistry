"""
Authentication Service

Business logic for user authentication and registration.
"""

from datetime import datetime, timezone
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.security import verify_password, get_password_hash, create_access_token
from app.schemas.user import UserCreate, UserInDB
from app.core.logging import get_logger

logger = get_logger(__name__)


class AuthService:
    """Authentication service for user management"""
    
    @staticmethod
    async def authenticate_user(
        db: AsyncIOMotorDatabase,
        email: str,
        password: str
    ) -> Optional[UserInDB]:
        """
        Authenticate a user with email and password
        
        Args:
            db: Database instance
            email: User email
            password: Plain text password
            
        Returns:
            UserInDB if authentication successful, None otherwise
        """
        user = await db.users.find_one({"email": email})
        
        if not user:
            logger.warning(f"Login attempt for non-existent user: {email}")
            return None
        
        if not verify_password(password, user["hashed_password"]):
            logger.warning(f"Failed login attempt for user: {email}")
            return None
        
        # Convert ObjectId to string for Pydantic validation
        user["_id"] = str(user["_id"])
        
        logger.info(f"Successful login for user: {email}")
        return UserInDB(**user)
    
    @staticmethod
    async def create_user(
        db: AsyncIOMotorDatabase,
        user_data: UserCreate
    ) -> UserInDB:
        """
        Create a new user
        
        Args:
            db: Database instance
            user_data: User registration data
            
        Returns:
            The created user
            
        Raises:
            ValueError: If user already exists
        """
        # Check if user already exists
        existing_user = await db.users.find_one({
            "$or": [
                {"email": user_data.email},
                {"username": user_data.username}
            ]
        })
        
        if existing_user:
            if existing_user.get("email") == user_data.email:
                raise ValueError("Email already registered")
            if existing_user.get("username") == user_data.username:
                raise ValueError("Username already taken")
        
        # Create user document
        now = datetime.now(timezone.utc)
        user_dict = {
            "email": user_data.email,
            "username": user_data.username,
            "full_name": user_data.full_name,
            "hashed_password": get_password_hash(user_data.password),
            "is_active": True,
            "is_verified": False,
            "role": "user",  # Default role; use seed_admin.py to create verifier/admin
            "wallet_address": user_data.wallet_address,
            "created_at": now,
            "updated_at": now,
        }
        
        # Insert into database
        result = await db.users.insert_one(user_dict)
        user_dict["_id"] = str(result.inserted_id)
        
        logger.info(f"New user registered: {user_data.email}")
        return UserInDB(**user_dict)
    
    @staticmethod
    def create_user_token(user: UserInDB) -> str:
        """
        Create access token for user
        
        Args:
            user: User to create token for
            
        Returns:
            JWT access token
        """
        token_data = {"sub": user.email, "role": user.role}
        return create_access_token(token_data)


# Create service instance
auth_service = AuthService()
