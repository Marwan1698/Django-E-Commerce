import os

from django.core.exceptions import ImproperlyConfigured

from .base import *  # noqa: F403
from .base import ALLOWED_HOSTS, CSRF_TRUSTED_ORIGINS, JWT_REFRESH_COOKIE, SECRET_KEY, STORAGES, env_bool

if not SECRET_KEY:
    raise ImproperlyConfigured("DJANGO_SECRET_KEY must be set in production.")

DEBUG = False

# Render (and similar hosts) expose the public hostname; trust it automatically.
_external_host = os.environ.get("RENDER_EXTERNAL_HOSTNAME")
if _external_host:
    ALLOWED_HOSTS = [*ALLOWED_HOSTS, _external_host]
    CSRF_TRUSTED_ORIGINS = [*CSRF_TRUSTED_ORIGINS, f"https://{_external_host}"]

STORAGES = {
    **STORAGES,
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
}

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = env_bool("DJANGO_SECURE_SSL_REDIRECT", True)
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 60 * 60 * 24 * 30
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"
JWT_REFRESH_COOKIE = {**JWT_REFRESH_COOKIE, "secure": env_bool("JWT_REFRESH_COOKIE_SECURE", True)}
