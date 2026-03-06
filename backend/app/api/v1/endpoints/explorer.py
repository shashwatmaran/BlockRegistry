"""
Blockchain Explorer Endpoints

Public endpoints for the frontend Explorer page.
No authentication required — these are read-only, public-facing stats.
"""

from fastapi import APIRouter, Depends
from typing import List, Dict, Any, Optional
from datetime import datetime

from app.db.mongodb import get_database
from app.models.land import LandModel

router = APIRouter()


@router.get("/stats")
async def get_explorer_stats(db=Depends(get_database)) -> Dict[str, Any]:
    """
    Aggregate counts from MongoDB for the network stats cards:
    - total_properties: all land records
    - verified_properties: blockchain_status = 'verified'
    - pending_properties: blockchain_status = 'pending' or 'not_minted'
    - total_users: count of documents in users collection
    """
    collection = db[LandModel.collection_name]

    total = await collection.count_documents({})
    verified = await collection.count_documents({"blockchain_status": "verified"})
    pending = await collection.count_documents(
        {"blockchain_status": {"$in": ["pending", "not_minted"]}}
    )
    rejected = await collection.count_documents({"blockchain_status": "rejected"})

    # Count unique owner_ids as a proxy for active users
    owner_ids = await collection.distinct("owner_id")
    active_users = len(owner_ids)

    return {
        "total_properties": total,
        "verified_properties": verified,
        "pending_properties": pending,
        "rejected_properties": rejected,
        "active_users": active_users,
    }


@router.get("/transactions")
async def get_recent_transactions(db=Depends(get_database)) -> List[Dict[str, Any]]:
    """
    Return the 20 most-recently-updated land records as 'transactions'.
    Each land update (register, mint, verify, reject) corresponds to a
    blockchain or DB write, making them the closest approximation to txns.
    """
    collection = db[LandModel.collection_name]

    cursor = collection.find(
        {},
        {
            "_id": 1,
            "title": 1,
            "owner_id": 1,
            "blockchain_status": 1,
            "blockchain_tx_hash": 1,
            "token_id": 1,
            "updated_at": 1,
            "created_at": 1,
            "status": 1,
        }
    ).sort("updated_at", -1).limit(20)

    lands = await cursor.to_list(length=20)

    result = []
    for land in lands:
        status = land.get("blockchain_status", "not_minted")

        # Map blockchain_status to a human-readable tx type
        type_map = {
            "not_minted": "Property Submitted",
            "pending": "NFT Minted",
            "verified": "Verified On-Chain",
            "rejected": "Application Rejected",
        }
        tx_type = type_map.get(status, "Unknown")

        # Status → confirmed / pending
        is_confirmed = status in ("verified", "rejected")
        tx_status = "confirmed" if is_confirmed else "pending"

        tx_hash = land.get("blockchain_tx_hash") or ""
        updated_at = land.get("updated_at") or land.get("created_at") or datetime.utcnow()

        # Format timestamp as a readable string
        if isinstance(updated_at, datetime):
            delta = datetime.utcnow() - updated_at
            secs = int(delta.total_seconds())
            if secs < 60:
                time_str = f"{secs} secs ago"
            elif secs < 3600:
                time_str = f"{secs // 60} mins ago"
            else:
                time_str = f"{secs // 3600} hrs ago"
        else:
            time_str = str(updated_at)

        owner_id = str(land.get("owner_id", ""))
        # Truncate owner to look like an address
        from_display = f"{owner_id[:6]}...{owner_id[-4:]}" if len(owner_id) > 10 else owner_id

        result.append({
            "hash": tx_hash or str(land["_id"]),
            "type": tx_type,
            "from": from_display,
            "to": "Registry Contract",
            "value": f"PROP-{str(land['_id'])[:8].upper()}",
            "timestamp": time_str,
            "status": tx_status,
            "token_id": land.get("token_id"),
            "land_id": str(land["_id"]),
        })

    return result


@router.get("/properties")
async def get_explorer_properties(db=Depends(get_database)) -> List[Dict[str, Any]]:
    """
    Return latest 20 land records (all statuses) for the Properties tab.
    """
    collection = db[LandModel.collection_name]

    cursor = collection.find(
        {},
        {
            "_id": 1,
            "title": 1,
            "area": 1,
            "price": 1,
            "location": 1,
            "blockchain_status": 1,
            "status": 1,
            "token_id": 1,
            "blockchain_tx_hash": 1,
            "created_at": 1,
            "updated_at": 1,
        }
    ).sort("updated_at", -1).limit(20)

    lands = await cursor.to_list(length=20)

    result = []
    for land in lands:
        updated_at = land.get("updated_at") or land.get("created_at") or datetime.utcnow()
        if isinstance(updated_at, datetime):
            delta = datetime.utcnow() - updated_at
            secs = int(delta.total_seconds())
            if secs < 60:
                time_str = f"{secs} secs ago"
            elif secs < 3600:
                time_str = f"{secs // 60} mins ago"
            elif secs < 86400:
                time_str = f"{secs // 3600} hrs ago"
            else:
                time_str = f"{secs // 86400} days ago"
        else:
            time_str = str(updated_at)

        location = land.get("location", {})
        if isinstance(location, dict):
            address = location.get("address") or f"Lat {location.get('lat', 'N/A')}, Lng {location.get('lng', 'N/A')}"
        else:
            address = str(location) if location else "—"

        blockchain_status = land.get("blockchain_status", "not_minted")
        is_verified = blockchain_status == "verified"

        result.append({
            "id": str(land["_id"]),
            "prop_id": f"PROP-{str(land['_id'])[:8].upper()}",
            "title": land.get("title", "Untitled Property"),
            "address": address,
            "area": land.get("area", 0),
            "price": land.get("price", 0),
            "blockchain_status": blockchain_status,
            "is_verified": is_verified,
            "token_id": land.get("token_id"),
            "tx_hash": land.get("blockchain_tx_hash"),
            "time_ago": time_str,
        })

    return result


@router.get("/network")
async def get_network_info() -> Dict[str, Any]:
    """
    Fetch live Sepolia network data from the blockchain service:
    - Latest block number
    - Current gas price (in Gwei)
    - Chain ID
    - Whether connected
    """
    try:
        from app.services.blockchain import blockchain_service
        w3 = blockchain_service.w3

        is_connected = w3.is_connected()
        if not is_connected:
            return {
                "connected": False,
                "status": "disconnected",
                "latest_block": None,
                "gas_price_gwei": None,
                "chain_id": None,
                "network_name": "Sepolia Testnet",
            }

        latest_block = w3.eth.block_number
        gas_price_wei = w3.eth.gas_price
        gas_price_gwei = round(gas_price_wei / 1e9, 2)
        chain_id = w3.eth.chain_id

        # Get latest block for timestamp (to compute block time)
        latest_block_data = w3.eth.get_block("latest")
        prev_block_data = w3.eth.get_block(latest_block - 1) if latest_block > 0 else None

        block_time = None
        if latest_block_data and prev_block_data:
            block_time = int(latest_block_data["timestamp"]) - int(prev_block_data["timestamp"])

        return {
            "connected": True,
            "status": "active",
            "latest_block": latest_block,
            "gas_price_gwei": gas_price_gwei,
            "chain_id": chain_id,
            "network_name": "Sepolia Testnet",
            "block_time_seconds": block_time,
        }

    except Exception as e:
        return {
            "connected": False,
            "status": "error",
            "error": str(e),
            "latest_block": None,
            "gas_price_gwei": None,
            "chain_id": None,
            "network_name": "Sepolia Testnet",
        }
