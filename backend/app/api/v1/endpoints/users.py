"""
User Management Endpoints

This module contains endpoints for user profile management,
including wallet linking functionality.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from datetime import datetime
from bson import ObjectId

from app.api.deps import get_current_user
from app.db.mongodb import get_database
from app.schemas.user import UserInDB
from app.models.user import UserModel

# Wallet signature verification
from eth_account.messages import encode_defunct
from eth_account import Account

router = APIRouter()


class LinkWalletRequest(BaseModel):
    wallet_address: str
    signature: str


class WalletResponse(BaseModel):
    wallet_address: str
    wallet_linked_at: str
    message: str


def verify_wallet_signature(wallet_address: str, signature: str, user_email: str) -> bool:
    """
    Verify that the signature was created by the wallet owner.
    
    Args:
        wallet_address: The Ethereum wallet address
        signature: The signature to verify
        user_email: User's email (part of signed message)
        
    Returns:
        bool: True if signature is valid, False otherwise
    """
    try:
        # Reconstruct the message that was signed
        message = f"Link wallet {wallet_address} to account {user_email}"
        message_hash = encode_defunct(text=message)
        
        # Recover the address that signed the message
        recovered_address = Account.recover_message(message_hash, signature=signature)
        
        # Compare addresses (case-insensitive)
        return recovered_address.lower() == wallet_address.lower()
    except Exception as e:
        print(f"Signature verification error: {e}")
        return False


@router.post("/link-wallet", response_model=WalletResponse)
async def link_wallet(
    request: LinkWalletRequest,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Link an Ethereum wallet address to the current user's account.
    Requires signature verification to prove wallet ownership.
    """
    
    # Verify the signature
    if not verify_wallet_signature(request.wallet_address, request.signature, current_user.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid signature. Could not verify wallet ownership."
        )
    
    # Check if wallet is already linked to another account
    existing_user = await db[UserModel.collection_name].find_one({
        "wallet_address": request.wallet_address.lower()
    })
    
    if existing_user and str(existing_user["_id"]) != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This wallet is already linked to another account."
        )
    
    # Update user with wallet address
    await db[UserModel.collection_name].update_one(
        {"_id": ObjectId(current_user.id)},
        {
            "$set": {
                "wallet_address": request.wallet_address.lower(),
                "wallet_linked_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return WalletResponse(
        wallet_address=request.wallet_address,
        wallet_linked_at=datetime.utcnow().isoformat(),
        message="Wallet successfully linked to your account"
    )


@router.post("/unlink-wallet")
async def unlink_wallet(
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Unlink the wallet address from the current user's account.
    """
    
    # Remove wallet address from user
    await db[UserModel.collection_name].update_one(
        {"_id": ObjectId(current_user.id)},
        {
            "$set": {
                "wallet_address": None,
                "wallet_linked_at": None,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return {"message": "Wallet successfully unlinked from your account"}


@router.get("/wallet-status")
async def get_wallet_status(
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Get the current wallet linking status for the user.
    """
    
    user = await db[UserModel.collection_name].find_one({"_id": ObjectId(current_user.id)})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "wallet_address": user.get("wallet_address"),
        "wallet_linked_at": user.get("wallet_linked_at").isoformat() if user.get("wallet_linked_at") else None,
        "is_linked": bool(user.get("wallet_address"))
    }
