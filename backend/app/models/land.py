from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

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
        "created_at": "datetime",
        "updated_at": "datetime"
    }

    @staticmethod
    def create_indexes():
        return [
            {"keys": [("owner_id", 1)]},
            {"keys": [("status", 1)]}
        ]
