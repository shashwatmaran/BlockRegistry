import os
import requests
from fastapi import UploadFile, HTTPException
from app.core.config import settings

class PinataService:
    BASE_URL = "https://api.pinata.cloud"
    
    def __init__(self):
        self.api_key = settings.PINATA_API_KEY
        self.secret_key = settings.PINATA_SECRET_API_KEY
        
        if not self.api_key or not self.secret_key:
            print("Warning: Pinata API keys not found in environment variables.")

    def upload_file(self, file: UploadFile) -> str:
        """
        Upload a file to Pinata IPFS
        Returns: IPFS Hash (CID)
        """
        if not self.api_key or not self.secret_key:
            raise HTTPException(status_code=500, detail="Pinata configuration missing")

        url = f"{self.BASE_URL}/pinning/pinFileToIPFS"
        
        # Prepare headers (requires specific format for boundary, let requests handle it)
        headers = {
            "pinata_api_key": self.api_key,
            "pinata_secret_api_key": self.secret_key
        }
        
        try:
            # Read file content
            file_content = file.file.read()
            files = { 'file': (file.filename, file_content) }
            
            response = requests.post(url, headers=headers, files=files)
            
            # Reset file pointer for other uses if needed
            file.file.seek(0)
            
            if response.status_code == 200:
                return response.json()['IpfsHash']
            else:
                raise HTTPException(status_code=500, detail=f"Pinata upload failed: {response.text}")
                
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

pinata_service = PinataService()
