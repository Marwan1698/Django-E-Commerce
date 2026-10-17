from decimal import Decimal

from django.conf import settings
from django.db import models


class Cart(models.Model):
    """One persistent cart per user. Totals are always computed, never stored."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="cart"
    )
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def total(self):
        return sum((item.line_total for item in self.items.all()), Decimal("0.00"))

    @property
    def item_count(self):
        return sum(item.quantity for item in self.items.all())

    def __str__(self):
        return f"{self.user}'s cart"
