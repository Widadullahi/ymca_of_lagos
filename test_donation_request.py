
import requests
import json

url = "http://127.0.0.1:8000/api/v1/initiate/donation"
data = {
    "name": "Test User",
    "amount": "1000",
    "email": "test@example.com",
    "redirect_url": "http://localhost:5174"
}
headers = {"Content-Type": "application/json"}

response = requests.post(url, data=json.dumps(data), headers=headers)
print(f"Status code: {response.status_code}")
print(f"Response content: {response.text}")
