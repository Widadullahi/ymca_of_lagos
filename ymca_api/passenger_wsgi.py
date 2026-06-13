import os
import sys

# Add the project directory to the sys.path
sys.path.insert(0, os.path.dirname(__file__))

# Set the Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Import the WSGI application
from backend.wsgi import application
