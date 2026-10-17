from .base import *  # noqa: F403
from .base import REST_FRAMEWORK

SECRET_KEY = "test-only-insecure-key-padded-to-at-least-32-bytes"
DATABASES = {"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": ":memory:"}}
PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]
REST_FRAMEWORK = {**REST_FRAMEWORK, "DEFAULT_THROTTLE_RATES": {"auth": None}}
