"""
Token Schemas

Pydantic models for authentication token validation.
"""

from pydantic import BaseModel
from typing import Optional


class Token(BaseModel):
    """Access token response"""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Data encoded in JWT token"""
    email: Optional[str] = None
    username: Optional[str] = None


class LoginRequest(BaseModel):
    """Login request schema"""
    email: str
    password: str
