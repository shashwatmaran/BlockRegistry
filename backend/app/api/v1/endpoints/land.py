from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import List, Optional
import json
import re
from datetime import datetime
from bson import ObjectId

from app.api.deps import get_current_user, get_current_verifier_or_admin
from app.db.mongodb import get_database

from app.models.land import LandModel
from app.models.user import UserModel
from app.schemas.land import (
    LandCreate, LandResponse, LocationSchema, DocumentSchema, OwnershipVerificationResponse,
    ToggleForSaleRequest, InitiateTransferRequest, DisputeTransferRequest, ResolveDisputeRequest
)
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
    property_id: str = Form(...),
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
    
    # Validate Property ID (14 alphanumeric characters)
    if not re.match(r"^[A-Za-z0-9]{14}$", property_id):
        raise HTTPException(status_code=400, detail="Property ID must be exactly 14 alphanumeric characters")
        
    # Check if property ID already exists
    existing = await db[LandModel.collection_name].find_one({"property_id": property_id})
    if existing:
        raise HTTPException(status_code=400, detail="Property ID is already registered")
    
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
        "property_id": property_id,
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
        "verification_count": 0,
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

@router.get("/transfers/my")
async def get_my_transfers(
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get all incoming and outgoing pending/paid/disputed transfers for the current user"""
    collection = db[LandModel.collection_name]
    
    # Incoming
    incoming_cursor = collection.find({
        "pending_buyer_id": str(current_user.id),
        "transfer_status": {"$in": ["pending", "paid", "disputed"]}
    })
    incoming = await incoming_cursor.to_list(length=100)
    
    # Outgoing
    outgoing_cursor = collection.find({
        "owner_id": ObjectId(current_user.id),
        "transfer_status": {"$in": ["pending", "paid", "disputed"]}
    })
    outgoing = await outgoing_cursor.to_list(length=100)
    
    # Format IDs
    for item in incoming + outgoing:
        item["_id"] = str(item["_id"])
        item["id"] = item["_id"]
        if "owner_id" in item:
            item["owner_id"] = str(item["owner_id"])
        
    return {
        "incoming": incoming,
        "outgoing": outgoing
    }

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
            property_id=land.get("property_id"),
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


@router.get("/verify-ownership/{land_id}", response_model=OwnershipVerificationResponse)
async def verify_ownership(
    land_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Verify ownership of a land parcel by reading both DB and on-chain data.
    Returns rich blockchain ownership details including on-chain owner address,
    IPFS hash, verification status, and Etherscan transaction link.
    """
    if not ObjectId.is_valid(land_id):
        raise HTTPException(status_code=400, detail="Invalid land ID format")

    land = await db[LandModel.collection_name].find_one({"_id": ObjectId(land_id)})
    if not land:
        raise HTTPException(status_code=404, detail="Land not found")

    is_owner = str(land["owner_id"]) == str(current_user.id)
    token_id = land.get("token_id")
    blockchain_status = land.get("blockchain_status", "not_minted")
    ipfs_hash = None
    ipfs_url = None
    on_chain_owner = None

    # Try to fetch live on-chain data if the land has been minted
    if token_id is not None:
        try:
            on_chain = blockchain_service.get_land_details(token_id)
            if on_chain:
                ipfs_hash = on_chain.get("ipfs_hash") or (land.get("documents") or [{}])[0].get("ipfs_hash")
                on_chain_owner = on_chain.get("current_owner")
                verification_count = on_chain.get("verification_count", 0)
        except Exception as e:
            print(f"[verify-ownership] blockchain lookup failed for token {token_id}: {e}")

    # Fallback to DB documents for ipfs_hash if not fetched from chain
    if not ipfs_hash:
        docs = land.get("documents", [])
        if docs:
            ipfs_hash = docs[0].get("ipfs_hash")

    if ipfs_hash:
        ipfs_url = f"https://ipfs.io/ipfs/{ipfs_hash}"

    tx_hash = land.get("blockchain_tx_hash")
    etherscan_url = f"https://sepolia.etherscan.io/tx/{tx_hash}" if tx_hash else None

    return OwnershipVerificationResponse(
        land_id=land_id,
        title=land.get("title", ""),
        token_id=token_id,
        blockchain_status=blockchain_status,
        db_status=land.get("status", "pending"),
        on_chain_owner=on_chain_owner,
        ipfs_hash=ipfs_hash,
        ipfs_url=ipfs_url,
        verified_at=land.get("verified_at"),
        verified_by=land.get("verified_by"),
        verified_by_list=land.get("verified_by_list", []),
        verification_count=verification_count if token_id is not None else land.get("verification_count", 0),
        rejection_reason=land.get("rejection_reason"),
        tx_hash=tx_hash,
        etherscan_url=etherscan_url,
        is_owned_by_current_user=is_owner,
    )


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


@router.delete("/{land_id}")
async def delete_land(
    land_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """Delete a rejected land application"""
    if not ObjectId.is_valid(land_id):
        raise HTTPException(status_code=400, detail="Invalid land ID format")
        
    land = await db[LandModel.collection_name].find_one({"_id": ObjectId(land_id)})
    if not land or str(land["owner_id"]) != str(current_user.id):
        raise HTTPException(status_code=404, detail="Land not found or unauthorized")
        
    if land.get("status") != "rejected":
        raise HTTPException(status_code=400, detail="Only rejected applications can be deleted")
        
    await db[LandModel.collection_name].delete_one({"_id": ObjectId(land_id)})
    return {"message": "Rejected application deleted successfully"}


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

    if current_user.wallet_address:
        verifier_address = current_user.wallet_address
    else:
        # MongoDB ID is 24 hex chars. Pad to 40 hex chars to create a valid deterministic Ethereum address
        padded_id = str(current_user.id).zfill(40)
        verifier_address = f"0x{padded_id}"
    try:
        result = blockchain_service.verify_land(token_id, verifier_address)
    except Exception as e:
        error_msg = str(e)
        if "execution reverted" in error_msg:
            # Extract the pure revert reason if possible
            reason = error_msg.split("execution reverted:")[-1].strip()
            raise HTTPException(status_code=400, detail=f"Smart contract rejected the transaction: {reason}")
        raise HTTPException(status_code=500, detail=f"Blockchain verification failed: {error_msg}")

    if not result or result.get("status") != "success":
        raise HTTPException(status_code=500, detail="Blockchain verification failed")

    # Fetch updated details to see if fully verified
    details = blockchain_service.get_land_details(token_id)
    verification_count = details.get("verification_count", 0) if details else 0

    if verification_count >= 3:
        update_data = {
            "blockchain_status": "verified",
            "blockchain_tx_hash": result["tx_hash"],
            "verified_at": datetime.utcnow(),
            "verified_by": verifier_address,
            "status": "verified",
            "verification_count": verification_count,
            "updated_at": datetime.utcnow()
        }
    else:
        update_data = {
            "blockchain_tx_hash": result["tx_hash"],
            "verification_count": verification_count,
            "updated_at": datetime.utcnow()
            # Status remains 'pending'
        }

    await db[LandModel.collection_name].update_one(
        {"_id": ObjectId(land_id)},
        {
            "$set": update_data,
            "$addToSet": {"verified_by_list": verifier_address}
        }
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

# ==================== TRANSFER & ESCROW ENDPOINTS ====================

@router.patch("/{land_id}/for-sale", response_model=LandResponse)
async def toggle_for_sale(
    land_id: str,
    request: ToggleForSaleRequest,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    if not ObjectId.is_valid(land_id):
        raise HTTPException(status_code=400, detail="Invalid land ID format")

    land = await db[LandModel.collection_name].find_one({"_id": ObjectId(land_id)})
    if not land or str(land["owner_id"]) != str(current_user.id):
        raise HTTPException(status_code=404, detail="Land not found or unauthorized")

    if land.get("blockchain_status") != "verified":
        raise HTTPException(status_code=400, detail="Only verified properties can be listed for sale")

    await db[LandModel.collection_name].update_one(
        {"_id": ObjectId(land_id)},
        {"$set": {"is_for_sale": request.is_for_sale, "updated_at": datetime.utcnow()}}
    )
    
    land = await db[LandModel.collection_name].find_one({"_id": ObjectId(land_id)})
    land["id"] = str(land["_id"])
    land["owner_id"] = str(land["owner_id"])
    return land


@router.post("/{land_id}/transfer/initiate")
async def initiate_transfer(
    land_id: str,
    request: InitiateTransferRequest,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """Seller initiates a transfer to a buyer"""
    if not ObjectId.is_valid(land_id):
        raise HTTPException(status_code=400, detail="Invalid land ID format")

    land = await db[LandModel.collection_name].find_one({"_id": ObjectId(land_id)})
    if not land or str(land["owner_id"]) != str(current_user.id):
        raise HTTPException(status_code=404, detail="Land not found or unauthorized")

    if land.get("blockchain_status") != "verified":
        raise HTTPException(status_code=400, detail="Only verified properties can be transferred")

    if land.get("transfer_status") in ["pending", "paid", "disputed"]:
        raise HTTPException(status_code=400, detail="Property is already in a transfer process")

    buyer = await db[UserModel.collection_name].find_one({"email": request.buyer_email})
    if not buyer:
        raise HTTPException(status_code=404, detail="Buyer email not found in the system")
        
    if str(buyer["_id"]) == str(current_user.id):
        raise HTTPException(status_code=400, detail="Cannot transfer property to yourself")

    await db[LandModel.collection_name].update_one(
        {"_id": ObjectId(land_id)},
        {"$set": {
            "transfer_status": "pending",
            "pending_buyer_id": str(buyer["_id"]),
            "is_for_sale": False, # Lock property
            "updated_at": datetime.utcnow()
        }}
    )

    return {"message": "Transfer initiated successfully. Property is now locked."}


@router.post("/{land_id}/transfer/mark-paid")
async def mark_transfer_paid(
    land_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """Buyer marks a transfer as paid"""
    if not ObjectId.is_valid(land_id):
        raise HTTPException(status_code=400, detail="Invalid land ID format")

    land = await db[LandModel.collection_name].find_one({"_id": ObjectId(land_id)})
    if not land or land.get("pending_buyer_id") != str(current_user.id):
        raise HTTPException(status_code=404, detail="You are not the pending buyer for this property")

    if land.get("transfer_status") != "pending":
        raise HTTPException(status_code=400, detail="Transfer is not in a pending state")

    await db[LandModel.collection_name].update_one(
        {"_id": ObjectId(land_id)},
        {"$set": {
            "transfer_status": "paid",
            "updated_at": datetime.utcnow()
        }}
    )

    return {"message": "Transfer marked as paid. Waiting for seller to release property."}


@router.post("/{land_id}/transfer/release")
async def release_transfer(
    land_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """Seller releases property to buyer"""
    if not ObjectId.is_valid(land_id):
        raise HTTPException(status_code=400, detail="Invalid land ID format")

    land = await db[LandModel.collection_name].find_one({"_id": ObjectId(land_id)})
    if not land or str(land["owner_id"]) != str(current_user.id):
        raise HTTPException(status_code=404, detail="Unauthorized")

    if land.get("transfer_status") not in ["pending", "paid", "disputed"]:
        raise HTTPException(status_code=400, detail="Property is not in a transfer process")

    buyer_id = land.get("pending_buyer_id")
    
    await db[LandModel.collection_name].update_one(
        {"_id": ObjectId(land_id)},
        {"$set": {
            "owner_id": ObjectId(buyer_id),
            "transfer_status": "none",
            "pending_buyer_id": None,
            "updated_at": datetime.utcnow()
        }}
    )

    return {"message": "Property successfully released to buyer."}


@router.post("/{land_id}/transfer/cancel")
async def cancel_transfer(
    land_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """Seller or Buyer cancels the transfer before payment"""
    if not ObjectId.is_valid(land_id):
        raise HTTPException(status_code=400, detail="Invalid land ID format")

    land = await db[LandModel.collection_name].find_one({"_id": ObjectId(land_id)})
    if not land:
        raise HTTPException(status_code=404, detail="Land not found")
        
    is_seller = str(land["owner_id"]) == str(current_user.id)
    is_buyer = land.get("pending_buyer_id") == str(current_user.id)
    
    if not (is_seller or is_buyer):
        raise HTTPException(status_code=404, detail="Unauthorized")

    if land.get("transfer_status") == "paid" and is_seller:
         raise HTTPException(status_code=400, detail="Cannot cancel a paid transfer. Use the dispute feature if there is an issue.")

    await db[LandModel.collection_name].update_one(
        {"_id": ObjectId(land_id)},
        {"$set": {
            "transfer_status": "none",
            "pending_buyer_id": None,
            "updated_at": datetime.utcnow()
        }}
    )

    return {"message": "Transfer cancelled successfully."}


@router.post("/{land_id}/transfer/dispute")
async def dispute_transfer(
    land_id: str,
    request: DisputeTransferRequest,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """Buyer disputes if they paid but seller didn't release"""
    if not ObjectId.is_valid(land_id):
        raise HTTPException(status_code=400, detail="Invalid land ID format")

    land = await db[LandModel.collection_name].find_one({"_id": ObjectId(land_id)})
    if not land or land.get("pending_buyer_id") != str(current_user.id):
         raise HTTPException(status_code=404, detail="Unauthorized")

    if land.get("transfer_status") != "paid":
         raise HTTPException(status_code=400, detail="Can only dispute a paid transfer")

    await db[LandModel.collection_name].update_one(
        {"_id": ObjectId(land_id)},
        {"$set": {
            "transfer_status": "disputed",
            "transfer_dispute_reason": request.reason,
            "updated_at": datetime.utcnow()
        }}
    )

    return {"message": "Transfer put into disputed state. Admin will resolve."}


@router.post("/{land_id}/transfer/resolve-dispute")
async def resolve_dispute(
    land_id: str,
    request: ResolveDisputeRequest,
    current_user: UserInDB = Depends(get_current_verifier_or_admin),
    db = Depends(get_database)
):
    """Admin resolves a dispute"""
    if not ObjectId.is_valid(land_id):
        raise HTTPException(status_code=400, detail="Invalid land ID format")

    land = await db[LandModel.collection_name].find_one({"_id": ObjectId(land_id)})
    if not land:
         raise HTTPException(status_code=404, detail="Land not found")

    if land.get("transfer_status") != "disputed":
         raise HTTPException(status_code=400, detail="Transfer is not disputed")

    if request.resolution == "force_transfer":
        buyer_id = land.get("pending_buyer_id")
        await db[LandModel.collection_name].update_one(
            {"_id": ObjectId(land_id)},
            {"$set": {
                "owner_id": ObjectId(buyer_id),
                "transfer_status": "none",
                "pending_buyer_id": None,
                "transfer_dispute_reason": None,
                "updated_at": datetime.utcnow()
            }}
        )
        return {"message": "Dispute resolved. Property forcefully transferred to buyer."}
        
    elif request.resolution == "cancel_transfer":
        await db[LandModel.collection_name].update_one(
            {"_id": ObjectId(land_id)},
            {"$set": {
                "transfer_status": "none",
                "pending_buyer_id": None,
                "transfer_dispute_reason": None,
                "updated_at": datetime.utcnow()
            }}
        )
        return {"message": "Dispute resolved. Transfer cancelled."}
    else:
        raise HTTPException(status_code=400, detail="Invalid resolution type")

