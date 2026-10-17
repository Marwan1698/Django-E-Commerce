# Models live in per-model folders; import them here so Django registers them.
from .user.user import User

__all__ = ["User"]
