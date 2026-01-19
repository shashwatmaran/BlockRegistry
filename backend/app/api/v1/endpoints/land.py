from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import List, Optional
import json
from datetime import datetime
from bson import ObjectId

from app.api.deps import get_current_user
from app.db.mongodb import get_database

from app.models.land import LandModel
from app.schemas.land import LandCreate, LandResponse, LocationSchema, DocumentSchema
from app.schemas.user import UserInDB
from app.services.pinata_service import pinata_service

router = APIRouter()

@router.post("/register", response_model=LandResponse)
async def register_land(
    title: str = Form(...),
    description: str = Form(...),
    area: float = Form(...),
    price: float = Form(...),
    lat: float = Form(...),
    lng: float = Form(...),
    address: str = Form(...),
    files: List[UploadFile] = File(...),
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Register a new land.
    1. Uploads documents to Pinata IPFS.
    2. Stores land details in MongoDB with 'pending' status.
    """
    
    # 1. Upload files to IPFS
    uploaded_documents = []
    for file in files:
        cid = pinata_service.upload_file(file)
        uploaded_documents.append({
            "name": file.filename,
            "ipfs_hash": cid,
            "type": file.content_type
        })
    
    # 2. Create Land Record
    land_data = {
        "owner_id": ObjectId(current_user.id),
        "title": title,
        "description": description,
        "area": area,
        "price": price,
        "location": {
            "lat": lat,
            "lng": lng,
            "address": address
        },
        "documents": uploaded_documents,
        "status": "pending",
        "is_for_sale": False,
        "blockchain_id": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db[LandModel.collection_name].insert_one(land_data)
    
    # Fetch and return
    created_land = await db[LandModel.collection_name].find_one({"_id": result.inserted_id})
    
    # Convert _id to string for Pydantic
    created_land["id"] = str(created_land["_id"])
    created_land["owner_id"] = str(created_land["owner_id"])
    
    return created_land

@router.get("/my-lands", response_model=List[LandResponse])
async def get_my_lands(current_user: UserInDB = Depends(get_current_user), db = Depends(get_database)):
    """Fetch lands owned by current user"""
    cursor = db[LandModel.collection_name].find({"owner_id": ObjectId(current_user.id)})
    lands = await cursor.to_list(length=100)
    
    result = []
    for land in lands:
        land["id"] = str(land["_id"])
        land["owner_id"] = str(land["owner_id"])
        result.append(land)
        
    return result

@router.get("/{land_id}", response_model=LandResponse)
async def get_land(land_id: str, db = Depends(get_database)):
    """Get land by ID"""
    if not ObjectId.is_valid(land_id):
        raise HTTPException(status_code=400, detail="Invalid ID format")
        
    land = await db[LandModel.collection_name].find_one({"_id": ObjectId(land_id)})
    if not land:
        raise HTTPException(status_code=404, detail="Land not found")
        
    land["id"] = str(land["_id"])
    land["owner_id"] = str(land["owner_id"])
    return land
