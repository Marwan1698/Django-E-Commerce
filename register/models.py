from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator

# Create your models here.

class CustomUser(AbstractUser):
    STATUS_CHOICES = (
    ('locked', 'Locked'),
    ('unlocked', 'Unlocked'),
    )
    ROLE_CHOICES = (
    ('customer', 'Customer'),
    ('admin', 'Admin'),
    )

    email = models.EmailField(unique=True)
    phone_num =  models.CharField(max_length=11, validators=[RegexValidator(r'^[0-9]{1,11}$')])
    address = models.CharField(max_length=100, blank=True)
    user_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="unlocked")
    user_role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="customer")

    def __str__(self):
        return self.username
    
    