"""
seed_admin.py — One-time script to create verifier or admin accounts in MongoDB.

Usage (from the backend/ directory with venv active):
  python seed_admin.py --email verifier@example.com --password Secret1234! --role verifier
  python seed_admin.py --email admin@example.com   --password Secret1234! --role admin

Roles: "user" | "verifier" | "admin"
"""

import asyncio
import argparse
from datetime import datetime, timezone

from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from dotenv import load_dotenv
import os

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME   = os.getenv("DB_NAME", "land_registry")


async def seed(email: str, password: str, role: str, full_name: str):
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]

    existing = await db.users.find_one({"email": email})
    if existing:
        print(f"[!] User '{email}' already exists (role: {existing.get('role', 'unknown')})")
        print("    To update the role, run this in MongoDB:")
        print(f'    db.users.updateOne({{email: "{email}"}}, {{$set: {{role: "{role}"}}}})')
        client.close()
        return

    now = datetime.now(timezone.utc)
    username = email.split("@")[0]

    # Ensure username is unique
    base = username
    counter = 1
    while await db.users.find_one({"username": username}):
        username = f"{base}{counter}"
        counter += 1

    doc = {
        "email": email,
        "username": username,
        "full_name": full_name or username,
        "hashed_password": pwd_context.hash(password),
        "role": role,
        "is_active": True,
        "is_verified": True,
        "wallet_address": None,
        "wallet_linked_at": None,
        "created_at": now,
        "updated_at": now,
    }

    result = await db.users.insert_one(doc)
    print(f"[✓] Created {role} account:")
    print(f"    email    : {email}")
    print(f"    username : {username}")
    print(f"    role     : {role}")
    print(f"    _id      : {result.inserted_id}")
    client.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed a verifier or admin user into MongoDB")
    parser.add_argument("--email",     required=True,  help="User email")
    parser.add_argument("--password",  required=True,  help="Plain-text password (will be hashed)")
    parser.add_argument("--role",      required=True,  choices=["user", "verifier", "admin"], help="Role")
    parser.add_argument("--name",      default="",     help="Full name (optional)")
    args = parser.parse_args()

    asyncio.run(seed(args.email, args.password, args.role, args.name))
