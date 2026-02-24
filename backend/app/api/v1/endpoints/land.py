from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import List, Optional
import json
from datetime import datetime
from bson import ObjectId

from app.api.deps import get_current_user, get_current_verifier_or_admin
from app.db.mongodb import get_database

from app.models.land import LandModel
from app.schemas.land import LandCreate, LandResponse, LocationSchema, DocumentSchema
from app.schemas.user import UserInDB
from app.schemas.verifier import (
    VerifyLandRequest,
    RejectLandRequest,
    VerifyLandResponse,
    RejectLandResponse,
    BlockchainTransactionResponse
)
from app.services.pinata_service import pinata_service
from app.services.blockchain import blockchain_service

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
        "blockchain_status": "not_minted",  # New field
        "token_id": None,
        "blockchain_tx_hash": None,
        "verified_at": None,
        "verified_by": None,
        "rejection_reason": None,
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


# ==================== VERIFICATION ENDPOINTS ====================
# IMPORTANT: These static routes MUST be defined before /{land_id}
# to prevent FastAPI from treating path segments as a land_id param.

@router.get("/all-pending", response_model=List[LandResponse])
async def get_all_pending_lands(
    current_user: UserInDB = Depends(get_current_verifier_or_admin),
    db = Depends(get_database)
):
    """
    Get all lands that need verifier action:
    - blockchain_status = 'not_minted' (submitted, needs minting)
    - blockchain_status = 'pending' (minted, awaiting verify/reject)
    """
    cursor = db[LandModel.collection_name].find(
        {"blockchain_status": {"$in": ["not_minted", "pending"]}}
    )
    lands = await cursor.to_list(length=200)

    result = []
    for land in lands:
        land["id"] = str(land["_id"])
        land["owner_id"] = str(land["owner_id"])
        result.append(land)

    return result


@router.get("/pending/list", response_model=List[LandResponse])
async def get_pending_lands(
    current_user: UserInDB = Depends(get_current_verifier_or_admin),
    db = Depends(get_database)
):
    """
    Get all pending lands (for verifiers)
    Returns lands with blockchain_status = 'pending'
    """
    cursor = db[LandModel.collection_name].find({"blockchain_status": "pending"})
    lands = await cursor.to_list(length=100)
    
    result = []
    for land in lands:
        land["id"] = str(land["_id"])
        land["owner_id"] = str(land["owner_id"])
        result.append(land)
        
    return result


@router.post("/{land_id}/mint")
async def mint_land(
    land_id: str,
    current_user: UserInDB = Depends(get_current_verifier_or_admin),
    db = Depends(get_database)
):
    """
    Mint a land NFT on-chain.

    Steps:
    1. Fetch land from MongoDB — must be 'not_minted'
    2. Upload metadata to IPFS (reuse first document hash or create metadata)
    3. Call blockchain_service.register_land() → returns token_id
    4. Update MongoDB: token_id, blockchain_status = 'pending'
    """
    if not ObjectId.is_valid(land_id):
        raise HTTPException(status_code=400, detail="Invalid land ID format")

    land = await db[LandModel.collection_name].find_one({"_id": ObjectId(land_id)})
    if not land:
        raise HTTPException(status_code=404, detail="Land not found")

    if land.get("blockchain_status") != "not_minted":
        raise HTTPException(
            status_code=400,
            detail=f"Land is not in not_minted state (current: {land.get('blockchain_status')})"
        )

    # Build ipfs_hash: prefer first doc hash, else use land ID as placeholder
    docs = land.get("documents", [])
    ipfs_hash = docs[0]["ipfs_hash"] if docs else land_id

    # Build location string — always ensure it's a str for Solidity ABI encoding
    raw_location = land.get("location", "")
    if isinstance(raw_location, dict):
        location_str = (
            raw_location.get("address")
            or f"{raw_location.get('lat', '')},{raw_location.get('lng', '')}"
        ).strip(",")
    else:
        location_str = str(raw_location) if raw_location else ""

    if not location_str:
        location_str = land_id  # last-resort placeholder

    # Safely coerce area/price to int
    try:
        area = int(float(land.get("area", 0)))
        price = int(float(land.get("price", 0)))
    except (TypeError, ValueError) as e:
        raise HTTPException(status_code=400, detail=f"Invalid area/price: {e}")

    # Call blockchain service — raises on failure (error propagated to HTTP response)
    try:
        result = blockchain_service.register_land(
            ipfs_hash=ipfs_hash,
            area=area,
            price=price,
            location=location_str,
            owner_address="0x0000000000000000000000000000000000000000"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Blockchain minting failed: {str(e)}")

    # result is guaranteed non-None (register_land now raises on failure)
    token_id = result.get("token_id")

    await db[LandModel.collection_name].update_one(
        {"_id": ObjectId(land_id)},
        {"$set": {
            "token_id": token_id,
            "blockchain_status": "pending",
            "blockchain_tx_hash": result["tx_hash"],
            "updated_at": datetime.utcnow()
        }}
    )

    return {
        "message": "Land minted successfully",
        "land_id": land_id,
        "token_id": token_id,
        "tx_hash": result["tx_hash"],
        "etherscan_url": f"https://sepolia.etherscan.io/tx/{result['tx_hash']}"
    }


@router.get("/verified/list", response_model=List[LandResponse])
async def get_verified_lands(db = Depends(get_database)):
    """
    Get all verified lands (public endpoint)
    Returns lands with blockchain_status = 'verified'
    """
    cursor = db[LandModel.collection_name].find({"blockchain_status": "verified"})
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


@router.post("/{land_id}/verify", response_model=VerifyLandResponse)
async def verify_land(
    land_id: str,
    request: VerifyLandRequest,
    current_user: UserInDB = Depends(get_current_verifier_or_admin),
    db = Depends(get_database)
):
    """
    Verify a land on blockchain.
    Uses ADMIN_PRIVATE_KEY — no verifier private key required.
    """
    if not ObjectId.is_valid(land_id):
        raise HTTPException(status_code=400, detail="Invalid land ID format")

    land = await db[LandModel.collection_name].find_one({"_id": ObjectId(land_id)})
    if not land:
        raise HTTPException(status_code=404, detail="Land not found")

    if land.get("blockchain_status") != "pending":
        raise HTTPException(
            status_code=400,
            detail=f"Land must be in 'pending' state to verify (current: {land.get('blockchain_status')})"
        )

    token_id = land.get("token_id")
    if token_id is None:
        raise HTTPException(status_code=400, detail="Land has no token ID (not minted yet)")

    try:
        result = blockchain_service.verify_land(token_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Blockchain verification failed: {str(e)}")

    if not result or result.get("status") != "success":
        raise HTTPException(status_code=500, detail="Blockchain verification failed")

    update_data = {
        "blockchain_status": "verified",
        "blockchain_tx_hash": result["tx_hash"],
        "verified_at": datetime.utcnow(),
        "verified_by": current_user.wallet_address or str(current_user.id),
        "status": "verified",
        "updated_at": datetime.utcnow()
    }

    await db[LandModel.collection_name].update_one(
        {"_id": ObjectId(land_id)},
        {"$set": update_data}
    )

    return VerifyLandResponse(
        message="Land verified successfully on blockchain",
        land_id=land_id,
        token_id=token_id,
        transaction=BlockchainTransactionResponse(
            tx_hash=result["tx_hash"],
            status="success",
            block_number=result.get("block_number"),
            gas_used=result.get("gas_used")
        ),
        etherscan_url=f"https://sepolia.etherscan.io/tx/{result['tx_hash']}"
    )


@router.post("/{land_id}/reject", response_model=RejectLandResponse)
async def reject_land(
    land_id: str,
    request: RejectLandRequest,
    current_user: UserInDB = Depends(get_current_verifier_or_admin),
    db = Depends(get_database)
):
    """
    Reject a land.
    - If not_minted: MongoDB update only (no blockchain call needed).
    - If pending: on-chain rejection via admin wallet, then MongoDB update.
    """
    if not ObjectId.is_valid(land_id):
        raise HTTPException(status_code=400, detail="Invalid land ID format")

    land = await db[LandModel.collection_name].find_one({"_id": ObjectId(land_id)})
    if not land:
        raise HTTPException(status_code=404, detail="Land not found")

    status = land.get("blockchain_status")
    if status not in ("not_minted", "pending"):
        raise HTTPException(
            status_code=400,
            detail=f"Land cannot be rejected in its current state: {status}"
        )

    token_id = land.get("token_id")
    verifier_id = current_user.wallet_address or str(current_user.id)

    # --- Pre-mint rejection: no blockchain call ---
    if status == "not_minted":
        await db[LandModel.collection_name].update_one(
            {"_id": ObjectId(land_id)},
            {"$set": {
                "blockchain_status": "rejected",
                "rejection_reason": request.reason,
                "verified_at": datetime.utcnow(),
                "verified_by": verifier_id,
                "status": "rejected",
                "updated_at": datetime.utcnow()
            }}
        )
        return RejectLandResponse(
            message="Land application rejected (before minting)",
            land_id=land_id,
            token_id=None,
            reason=request.reason,
            transaction=None,
            etherscan_url=None
        )

    # --- Post-mint rejection: on-chain ---
    if token_id is None:
        raise HTTPException(status_code=400, detail="Land has no token ID")

    try:
        result = blockchain_service.reject_land(token_id, request.reason)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Blockchain rejection failed: {str(e)}")

    if not result or result.get("status") != "success":
        raise HTTPException(status_code=500, detail="Blockchain rejection failed")

    await db[LandModel.collection_name].update_one(
        {"_id": ObjectId(land_id)},
        {"$set": {
            "blockchain_status": "rejected",
            "blockchain_tx_hash": result["tx_hash"],
            "verified_at": datetime.utcnow(),
            "verified_by": verifier_id,
            "rejection_reason": request.reason,
            "status": "rejected",
            "updated_at": datetime.utcnow()
        }}
    )

    return RejectLandResponse(
        message="Land rejected on blockchain",
        land_id=land_id,
        token_id=token_id,
        reason=request.reason,
        transaction=BlockchainTransactionResponse(
            tx_hash=result["tx_hash"],
            status="success",
            block_number=result.get("block_number"),
            gas_used=result.get("gas_used")
        ),
        etherscan_url=f"https://sepolia.etherscan.io/tx/{result['tx_hash']}"
    )
