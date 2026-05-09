import os
import django
import json
import base64
from io import BytesIO
from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils import timezone
from datetime import timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from rest_framework.test import APIClient
from account.models import EmailVerification, UserRequest

def get_dummy_image():
    # A small 1x1 transparent PNG
    base64_img = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
    img_data = base64.b64decode(base64_img)
    return SimpleUploadedFile("test.png", img_data, content_type="image/png")

def test_submission_without_verification():
    client = APIClient()
    email = "test-unverified@example.com"
    
    # Ensure no verified record exists
    EmailVerification.objects.filter(email=email).delete()
    
    data = {
        'first_name': 'Test',
        'last_name': 'User',
        'phone_number': '08012345678',
        'email': email,
        'citizen': 'Nigerian',
        'state': 'Lagos',
        'unit': 'Central Club',
        'address': 'Some long address for validation',
        'valid_id_number': '123456',
        'passport_photo': get_dummy_image()
    }
    
    response = client.post('/api/v1/requests/', data, format='multipart')
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {json.dumps(response.json(), indent=2)}")

def test_submission_with_verification():
    client = APIClient()
    email = "test-verified@example.com"
    
    # Create a verified record
    EmailVerification.objects.update_or_create(
        email=email,
        defaults={
            'code': '123456',
            'is_verified': True,
            'expires_at': timezone.now() + timedelta(hours=1),
            'verified_at': timezone.now()
        }
    )
    
    data = {
        'first_name': 'Test',
        'last_name': 'Verified User',
        'phone_number': '08012345678',
        'email': email,
        'citizen': 'Nigerian',
        'state': 'Lagos',
        'unit': 'Central Club',
        'address': 'Some long address for validation',
        'valid_id_number': '123456',
        'passport_photo': get_dummy_image()
    }
    
    response = client.post('/api/v1/requests/', data, format='multipart')
    print(f"\nStatus Code (Verified): {response.status_code}")
    if response.status_code != 201 and response.status_code != 200:
        print(f"Response Body (Verified): {json.dumps(response.json(), indent=2)}")

if __name__ == "__main__":
    print("Testing submission without verification:")
    test_submission_without_verification()
    print("\nTesting submission with verification:")
    test_submission_with_verification()
