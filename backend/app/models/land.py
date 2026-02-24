from datetime import datetime
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field, field_validator

class LandModel:
    """
    Land document structure for MongoDB
    """
    
    collection_name = "lands"
    
    # Example structure
    structure = {
        "_id": "ObjectId",
        "owner_id": "ObjectId", # Reference to User
        "title": "str",
        "description": "str",
        "area": "float", # in sqft or sq m
        "price": "float", # Estimated value
        "location": {
            "lat": "float",
            "lng": "float",
            "address": "str"
        },
        "documents": [
            {
                "name": "str",
                "ipfs_hash": "str",
                "type": "str" # e.g., 'deed', 'tax_receipt'
            }
        ],
        "status": "str", # 'pending', 'verified', 'rejected'
        "is_for_sale": "bool",
        "blockchain_id": "int", # Token ID on Smart Contract
        # Blockchain fields
        "token_id": "Optional[int]",
        "blockchain_status": "Literal['not_minted', 'pending', 'verified', 'rejected']",
        "blockchain_tx_hash": "Optional[str]",
        "verified_at": "Optional[datetime]",
        "verified_by": "Optional[str]",  # Verifier wallet address
        "rejection_reason": "Optional[str]",
        
        # Metadata
        "created_at": "datetime",
        "updated_at": "datetime"
    }

    @staticmethod
    def create_indexes():
        return [
            {"keys": [("owner_id", 1)]},
            {"keys": [("status", 1)]}
        ]
