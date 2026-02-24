"""
Blockchain service for interacting with Sepolia smart contracts
"""
import json
import os
from pathlib import Path
from typing import Optional, Dict, Any
from web3 import Web3
from web3.contract import Contract
from web3.exceptions import ContractLogicError
from eth_account import Account
from app.core.config import settings

class BlockchainService:
    """Service for interacting with Land Registry smart contracts on Sepolia"""
    
    def __init__(self):
        self.w3 = Web3(Web3.HTTPProvider(settings.SEPOLIA_RPC_URL))
        
        if not self.w3.is_connected():
            raise ConnectionError(f"Failed to connect to Sepolia RPC: {settings.SEPOLIA_RPC_URL}")
        
        # Load contract ABIs
        self.land_registry_abi = self._load_abi("LandRegistry.json")
        self.land_verification_abi = self._load_abi("LandVerification.json")
        
        # Initialize contracts
        self.land_registry = self.w3.eth.contract(
            address=Web3.to_checksum_address(settings.LAND_REGISTRY_ADDRESS),
            abi=self.land_registry_abi
        )
        
        self.land_verification = self.w3.eth.contract(
            address=Web3.to_checksum_address(settings.LAND_VERIFICATION_ADDRESS),
            abi=self.land_verification_abi
        )
    
    def _load_abi(self, filename: str) -> list:
        """Load ABI from contracts directory"""
        contracts_dir = Path(__file__).parent.parent / "contracts"
        abi_path = contracts_dir / filename
        
        with open(abi_path, 'r') as f:
            contract_json = json.load(f)
            # Foundry outputs comprehensive JSON with metadata, bytecode, and abi
            # We only need the 'abi' field
            return contract_json.get('abi', contract_json)
    
    def get_account_from_private_key(self, private_key: str) -> Account:
        """Create account from private key"""
        # Remove 0x prefix if present
        if private_key.startswith('0x'):
            private_key = private_key[2:]
        return Account.from_key(private_key)
    
    def check_verifier_role(self, address: str) -> bool:
        """Check if address has VERIFIER_ROLE"""
        try:
            checksum_address = Web3.to_checksum_address(address)
            # VERIFIER_ROLE = keccak256("VERIFIER_ROLE")
            verifier_role = Web3.keccak(text="VERIFIER_ROLE")
            
            has_role = self.land_registry.functions.hasRole(
                verifier_role,
                checksum_address
            ).call()
            
            return has_role
        except Exception as e:
            print(f"Error checking verifier role: {e}")
            return False
    
    def get_total_lands(self) -> int:
        """Get total number of registered lands"""
        try:
            return self.land_registry.functions.getTotalLands().call()
        except Exception as e:
            print(f"Error getting total lands: {e}")
            return 0
    
    def get_land_details(self, token_id: int) -> Optional[Dict[str, Any]]:
        """Get land details from blockchain"""
        try:
            details = self.land_registry.functions.getLandDetails(token_id).call()
            # LandMetadata struct order (LandRegistry.sol):
            # [0] ipfsHash, [1] area, [2] price, [3] location,
            # [4] currentOwner, [5] status, [6] registeredAt,
            # [7] verifiedAt, [8] verifiedBy
            return {
                "ipfs_hash": details[0],
                "area": details[1],
                "price": str(details[2]),
                "location": details[3],
                "current_owner": details[4],
                "status": details[5],        # 0=Pending, 1=Verified, 2=Rejected
                "registered_at": details[6],
                "verified_at": details[7],
                "verified_by": details[8],
            }
        except Exception as e:
            print(f"Error getting land details for token {token_id}: {e}")
            return None
    
    def _build_tx_params(self, from_address: str, gas: int) -> dict:
        """Build EIP-1559 transaction parameters, with legacy fallback."""
        base_fee = self.w3.eth.get_block('latest').get('baseFeePerGas')
        if base_fee is not None:
            # EIP-1559
            priority_fee = self.w3.eth.max_priority_fee or Web3.to_wei(1, 'gwei')
            max_fee = base_fee * 2 + priority_fee
            return {
                'from': from_address,
                'gas': gas,
                'maxFeePerGas': max_fee,
                'maxPriorityFeePerGas': priority_fee,
                'chainId': self.w3.eth.chain_id,
            }
        else:
            # Legacy fallback
            gas_price = self.w3.eth.gas_price or Web3.to_wei(10, 'gwei')
            return {
                'from': from_address,
                'gas': gas,
                'gasPrice': gas_price,
                'chainId': self.w3.eth.chain_id,
            }

    def verify_land(
        self,
        token_id: int,
    ) -> Optional[Dict[str, Any]]:
        """
        Verify a land on blockchain using the admin wallet.
        """
        try:
            admin_account = self.get_account_from_private_key(settings.ADMIN_PRIVATE_KEY)
            nonce = self.w3.eth.get_transaction_count(admin_account.address)

            tx_params = self._build_tx_params(admin_account.address, gas=200000)
            tx_params['nonce'] = nonce

            transaction = self.land_registry.functions.verifyLand(token_id).build_transaction(tx_params)

            signed_txn = self.w3.eth.account.sign_transaction(
                transaction,
                private_key=settings.ADMIN_PRIVATE_KEY
            )

            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.raw_transaction)
            tx_receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)

            return {
                "tx_hash": tx_hash.hex(),
                "status": "success" if tx_receipt['status'] == 1 else "failed",
                "block_number": tx_receipt['blockNumber'],
                "gas_used": tx_receipt['gasUsed'],
                "signer": admin_account.address,
            }

        except ContractLogicError as e:
            print(f"Contract logic error verifying land {token_id}: {e}")
            raise
        except Exception as e:
            print(f"Error verifying land {token_id}: {e}")
            raise
    
    def reject_land(
        self,
        token_id: int,
        reason: str,
    ) -> Optional[Dict[str, Any]]:
        """
        Reject a land on blockchain using the admin wallet.
        """
        try:
            admin_account = self.get_account_from_private_key(settings.ADMIN_PRIVATE_KEY)
            nonce = self.w3.eth.get_transaction_count(admin_account.address)

            tx_params = self._build_tx_params(admin_account.address, gas=200000)
            tx_params['nonce'] = nonce

            transaction = self.land_registry.functions.rejectLand(
                token_id,
                reason
            ).build_transaction(tx_params)

            signed_txn = self.w3.eth.account.sign_transaction(
                transaction,
                private_key=settings.ADMIN_PRIVATE_KEY
            )

            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.raw_transaction)
            tx_receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)

            return {
                "tx_hash": tx_hash.hex(),
                "status": "success" if tx_receipt['status'] == 1 else "failed",
                "block_number": tx_receipt['blockNumber'],
                "gas_used": tx_receipt['gasUsed'],
                "signer": admin_account.address,
            }

        except ContractLogicError as e:
            print(f"Contract logic error rejecting land {token_id}: {e}")
            raise
        except Exception as e:
            print(f"Error rejecting land {token_id}: {e}")
            raise
    
    def register_land(
        self,
        ipfs_hash: str,
        area: int,
        price: int,
        location: str,
        owner_address: str
    ) -> Dict[str, Any]:
        """
        Register/mint a new land NFT (called by backend on behalf of user).
        Uses the admin wallet as the on-chain signer (msg.sender).
        Raises on any failure so the calling endpoint can surface the real error.
        """
        import traceback

        admin_account = self.get_account_from_private_key(settings.ADMIN_PRIVATE_KEY)
        print(f"[Mint] Signer: {admin_account.address}")

        nonce = self.w3.eth.get_transaction_count(admin_account.address)
        print(f"[Mint] Nonce: {nonce}")

        # Estimate gas dynamically — cold SSTORE slots on first mint cost more than warm
        try:
            estimated_gas = self.land_registry.functions.registerLand(
                ipfs_hash, area, price, location
            ).estimate_gas({"from": admin_account.address})
            gas_limit = int(estimated_gas * 1.5)  # 50% safety buffer
            print(f"[Mint] Estimated gas: {estimated_gas}, using limit: {gas_limit}")
        except Exception as e:
            gas_limit = 500000  # safe fallback for cold storage
            print(f"[Mint] Gas estimation failed ({e}), using fallback: {gas_limit}")

        tx_params = self._build_tx_params(admin_account.address, gas=gas_limit)
        tx_params['nonce'] = nonce
        print(f"[Mint] Gas params: {tx_params}")

        try:
            transaction = self.land_registry.functions.registerLand(
                ipfs_hash,
                area,
                price,
                location
            ).build_transaction(tx_params)
        except Exception as e:
            print(f"[Mint] build_transaction failed: {e}")
            traceback.print_exc()
            raise RuntimeError(f"Failed to build transaction: {e}")

        try:
            signed_txn = self.w3.eth.account.sign_transaction(
                transaction,
                private_key=settings.ADMIN_PRIVATE_KEY
            )
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.raw_transaction)
            print(f"[Mint] tx sent: {tx_hash.hex()}")

            tx_receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
            print(f"[Mint] receipt status: {tx_receipt['status']}")

            if tx_receipt['status'] != 1:
                raise RuntimeError(f"Transaction reverted on-chain. tx_hash={tx_hash.hex()}")

        except Exception as e:
            print(f"[Mint] send/receipt failed: {e}")
            traceback.print_exc()
            raise

        # Parse LandRegistered event to get token_id
        token_id = None
        for log in tx_receipt['logs']:
            try:
                event = self.land_registry.events.LandRegistered().process_log(log)
                token_id = event['args']['tokenId']
                break
            except Exception:
                continue

        print(f"[Mint] token_id from event: {token_id}")

        return {
            "tx_hash": tx_hash.hex(),
            "token_id": token_id,
            "status": "success",
            "block_number": tx_receipt['blockNumber'],
            "gas_used": tx_receipt['gasUsed']
        }


# Singleton instance
blockchain_service = BlockchainService()
