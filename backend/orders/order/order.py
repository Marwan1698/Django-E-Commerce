from django.conf import settings
from django.db import models

from accounts.user.user import phone_validator


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PROCESSING = "processing", "Processing"
        SHIPPED = "shipped", "Shipped"
        DELIVERED = "delivered", "Delivered"
        CANCELLED = "cancelled", "Cancelled"

    class PaymentMethod(models.TextChoices):
        # Card payments should go through a provider (e.g. Stripe Checkout);
        # card data must never be stored in this database.
        CASH_ON_DELIVERY = "cash_on_delivery", "Cash on delivery"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="orders"
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    payment_method = models.CharField(
        max_length=30, choices=PaymentMethod.choices, default=PaymentMethod.CASH_ON_DELIVERY
    )
    full_name = models.CharField(max_length=150)
    phone_number = models.CharField(max_length=16, validators=[phone_validator])
    shipping_address = models.CharField(max_length=255)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    @property
    def can_cancel(self):
        return self.status == self.Status.PENDING

    def __str__(self):
        return f"Order #{self.pk} ({self.user})"
