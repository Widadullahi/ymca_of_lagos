
import os
import sys
from pathlib import Path

# Add the project root to path
sys.path.append(str(Path(__file__).parent))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

import django
django.setup()

from django.conf import settings

print("Testing env vars:")
print(f"REMITA_BASE_URL: {settings.REMITA_BASE_URL}")
print(f"REMITA_MERCHANT_ID: {settings.REMITA_MERCHANT_ID}")
print(f"REMITA_SERVICE_TYPE_ID: {settings.REMITA_SERVICE_TYPE_ID}")
print(f"REMITA_PUBLIC_KEY: {settings.REMITA_PUBLIC_KEY[:20] if settings.REMITA_PUBLIC_KEY else 'None'}...")
print("All good!" if all([settings.REMITA_MERCHANT_ID, settings.REMITA_API_KEY, settings.REMITA_SERVICE_TYPE_ID, settings.REMITA_PUBLIC_KEY]) else "Missing some vars!")
