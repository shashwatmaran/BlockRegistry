"""
User Schemas

Pydantic models for user request/response validation.
"""

from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    """Base user schema with common fields"""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    full_name: Optional[str] = None


class UserCreate(UserBase):
    """Schema for user registration"""
    password: str = Field(..., min_length=8, max_length=100)


class UserUpdate(BaseModel):
    """Schema for user update"""
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    full_name: Optional[str] = None
    password: Optional[str] = Field(None, min_length=8, max_length=100)


class UserInDB(UserBase):
    """Schema for user in database"""
    id: str = Field(..., alias="_id")
    hashed_password: str
    is_active: bool = True
    is_verified: bool = False
    wallet_address: Optional[str] = None
    wallet_linked_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True
    )


class UserResponse(UserBase):
    """Schema for user response (public data only)"""
    id: str = Field(..., alias="_id")
    is_active: bool
    is_verified: bool
    created_at: datetime
    
    model_config = ConfigDict(
        populate_by_name=True
    )
