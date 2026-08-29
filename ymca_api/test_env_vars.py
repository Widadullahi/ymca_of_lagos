
import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent  # this is ymca_api directory
env_path = BASE_DIR.parent / '.env'
print(f"Trying to load from env_path: {env_path}")
print(f"env_path exists: {env_path.exists()}")

load_dotenv(dotenv_path=env_path)

print("Remita env vars:")
print(f"REMITA_BASE_URL: {os.getenv('REMITA_BASE_URL')}")
print(f"REMITA_MERCHANT_ID: {os.getenv('REMITA_MERCHANT_ID')}")
print(f"REMITA_API_KEY: {os.getenv('REMITA_API_KEY')}")
print(f"REMITA_SERVICE_TYPE_ID: {os.getenv('REMITA_SERVICE_TYPE_ID')}")
print(f"REMITA_PUBLIC_KEY: {os.getenv('REMITA_PUBLIC_KEY')}")
