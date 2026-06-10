from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("DB_NAME")

client = MongoClient(MONGO_URL)
db = client[DB_NAME]

users_collection = db["users"]
applications_collection = db["applications"]
documents_collection = db["documents"]
ocr_collection = db["ocr_results"]
flags_collection = db["verification_flags"]
qr_tokens_collection = db["qr_tokens"]
entry_logs_collection = db["entry_logs"]
queue_collection = db["queue_assignments"]