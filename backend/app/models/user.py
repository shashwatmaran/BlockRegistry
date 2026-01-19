"""
User Database Model

This module defines the User model structure for MongoDB.
"""

from datetime import datetime
from typing import Optional


class UserModel:
    """
    User document structure for MongoDB
    
    This is a reference model showing the expected structure.
    MongoDB is schemaless, so this serves as documentation.
    """
    
    collection_name = "users"
    
    # Example structure
    structure = {
        "_id": "ObjectId",  # MongoDB auto-generated ID
        "email": "str",  # User email (unique)
        "username": "str",  # Username (unique)
        "hashed_password": "str",  # Bcrypt hashed password
        "full_name": "Optional[str]",  # User's full name
        "is_active": "bool",  # Account active status
        "is_verified": "bool",  # Email verification status
        "wallet_address": "Optional[str]",  # Linked Ethereum wallet address
        "wallet_linked_at": "Optional[datetime]",  # Wallet link timestamp
        "created_at": "datetime",  # Account creation timestamp
        "updated_at": "datetime",  # Last update timestamp
    }
    
    @staticmethod
    def create_indexes():
        """
        Define indexes for the users collection
        
        Returns:
            List of index definitions
        """
        return [
            {"keys": [("email", 1)], "unique": True},
            {"keys": [("username", 1)], "unique": True},
        ]
