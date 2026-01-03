import os
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from backend.db.models import PDFDocument


async def init_db():
    mongo_url = os.getenv("MONGODB_URL")
    db_name = os.getenv("MONGODB_DB_NAME")

    client = AsyncIOMotorClient(mongo_url)
    database = client[db_name]

    await init_beanie(database=database, document_models=[PDFDocument])

    return client, database
