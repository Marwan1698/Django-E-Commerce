from .base import *  # noqa: F403
from .base import SECRET_KEY

DEBUG = True
SECRET_KEY = SECRET_KEY or "dev-only-insecure-key-padded-to-at-least-32-bytes"
JWT_REFRESH_COOKIE = {**JWT_REFRESH_COOKIE, "secure": False}  # noqa: F405 (plain http locally)
