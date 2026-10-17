from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
from django.db import models

phone_validator = RegexValidator(
    r"^\+?[0-9]{7,15}$", "Enter a valid phone number (7-15 digits, optional leading +)."
)


class User(AbstractUser):
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=16, blank=True, validators=[phone_validator])
    address = models.CharField(max_length=255, blank=True)

    REQUIRED_FIELDS = ["email"]

    def __str__(self):
        return self.username
