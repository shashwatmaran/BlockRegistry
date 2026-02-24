"""
Schemas for land verification endpoints
"""
from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


class VerifyLandRequest(BaseModel):
    """Request to verify a land — no private key needed, backend uses ADMIN_PRIVATE_KEY"""
    pass  # No fields required; verifier identity comes from JWT


class RejectLandRequest(BaseModel):
    """Request to reject a land"""
    reason: str = Field(..., min_length=5, max_length=500, description="Rejection reason")


class BlockchainTransactionResponse(BaseModel):
    """Response for blockchain transaction"""
    tx_hash: str
    status: Literal["success", "failed"]
    block_number: Optional[int] = None
    gas_used: Optional[int] = None


class LandBlockchainInfo(BaseModel):
    """Blockchain information for a land"""
    token_id: Optional[int] = None
    blockchain_status: Literal["not_minted", "pending", "verified", "rejected"]
    blockchain_tx_hash: Optional[str] = None
    verified_at: Optional[datetime] = None
    verified_by: Optional[str] = None
    rejection_reason: Optional[str] = None


class VerifyLandResponse(BaseModel):
    """Response after verifying a land"""
    message: str
    land_id: str
    token_id: int
    transaction: BlockchainTransactionResponse
    etherscan_url: str


class RejectLandResponse(BaseModel):
    """Response after rejecting a land"""
    message: str
    land_id: str
    token_id: Optional[int] = None  # None when rejecting before minting
    reason: str
    transaction: Optional[BlockchainTransactionResponse] = None  # None for pre-mint rejections
    etherscan_url: Optional[str] = None
