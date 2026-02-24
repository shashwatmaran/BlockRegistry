from typing import List, Optional
from pydantic import BaseModel, HttpUrl
from datetime import datetime

class LocationSchema(BaseModel):
    lat: float
    lng: float
    address: str

class DocumentSchema(BaseModel):
    name: str
    ipfs_hash: str
    type: str

class LandBase(BaseModel):
    title: str
    description: str
    area: float
    price: float
    location: LocationSchema

class LandCreate(LandBase):
    pass

class LandUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    is_for_sale: Optional[bool] = None

class LandResponse(LandBase):
    id: str
    owner_id: str
    documents: List[DocumentSchema] = []
    status: str
    is_for_sale: bool
    blockchain_id: Optional[int] = None
    # Blockchain verification fields
    blockchain_status: str = "not_minted"
    token_id: Optional[int] = None
    blockchain_tx_hash: Optional[str] = None
    verified_at: Optional[datetime] = None
    verified_by: Optional[str] = None
    rejection_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
