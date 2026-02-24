"""
Admin Endpoints

Admin-only API endpoints for user management.
Requires role == "admin".
"""

from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.db.mongodb import get_database
from app.schemas.user import UserResponse, UserInDB
from app.api.deps import get_current_admin

router = APIRouter()

VALID_ROLES = {"user", "verifier", "admin"}


class RoleUpdateRequest(BaseModel):
    role: str


class WalletUpdateRequest(BaseModel):
    wallet_address: Optional[str] = None  # Pass null to remove wallet


@router.get("/users", response_model=List[UserResponse])
async def list_users(
    current_user: UserInDB = Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """
    List all users in the system.
    Admin only.
    """
    cursor = db.users.find({})
    users = await cursor.to_list(length=500)

    result = []
    for user in users:
        user["_id"] = str(user["_id"])
        result.append(user)

    return result


@router.patch("/users/{user_id}/role", response_model=UserResponse)
async def update_user_role(
    user_id: str,
    body: RoleUpdateRequest,
    current_user: UserInDB = Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """
    Update a user's role.
    Admin only. Cannot demote yourself.
    """
    if body.role not in VALID_ROLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Must be one of: {', '.join(VALID_ROLES)}"
        )

    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")

    # Prevent self-demotion
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot change your own role"
        )

    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"role": body.role}}
    )

    user["_id"] = str(user["_id"])
    user["role"] = body.role
    return user


@router.patch("/users/{user_id}/wallet", response_model=UserResponse)
async def update_user_wallet(
    user_id: str,
    body: WalletUpdateRequest,
    current_user: UserInDB = Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """
    Set or clear a user's public wallet address.
    Admin only. Only meaningful for verifier/admin accounts.
    """
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")

    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {
            "wallet_address": body.wallet_address,
            "wallet_linked_at": datetime.utcnow() if body.wallet_address else None,
        }}
    )

    user["_id"] = str(user["_id"])
    user["wallet_address"] = body.wallet_address
    return user
