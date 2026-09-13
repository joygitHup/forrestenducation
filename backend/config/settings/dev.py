import os

from .base import *  # noqa: F403

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'dev-only-not-for-prod')
DEBUG = True
ALLOWED_HOSTS = ['*']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

CORS_ALLOWED_ORIGINS = [
    'http://localhost:5000',
    'http://127.0.0.1:5000',
]
CORS_ALLOW_CREDENTIALS = False
CORS_ALLOW_HEADERS = ['accept', 'authorization', 'content-type', 'x-request-id']
CORS_ALLOW_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
