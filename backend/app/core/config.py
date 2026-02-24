"""
Application Configuration

This module provides centralized configuration management using Pydantic Settings.
All environment variables are loaded and validated here.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
from pathlib import Path


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Application
    APP_NAME: str = "Land Registry API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Database
    MONGO_URL: str
    DB_NAME: str
    
    # Security
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    CORS_ORIGINS: str = "*"
    
    # Pinata (IPFS)
    PINATA_API_KEY: Optional[str] = None
    PINATA_SECRET_API_KEY: Optional[str] = None
    
    # Blockchain (Sepolia Testnet)
    SEPOLIA_RPC_URL: str
    LAND_REGISTRY_ADDRESS: str = "0x5dcbc086ba6867e3c11aad2a5bcd7f55352699c4"
    LAND_VERIFICATION_ADDRESS: str = "0xa267cbe01c92431b29073c81c142c81bc10f0462"
    ADMIN_PRIVATE_KEY: str  # Private key for backend transactions (KEEP SECRET!)
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )
    
    @property
    def cors_origins_list(self) -> list[str]:
        """Convert CORS_ORIGINS string to list"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]


# Create global settings instance
settings = Settings()
