from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction

from catalog.models import Category, Product

DEMO_PRODUCTS = [
    ("Electronics", "Lenovo IdeaPad 5", "14\" laptop, 16 GB RAM, 512 GB SSD.", "649.00", 8),
    ("Electronics", "Wireless Headphones", "Noise-cancelling over-ear headphones.", "129.99", 15),
    ("Clothing", "Classic Hoodie", "Heavyweight cotton hoodie.", "39.90", 25),
    ("Clothing", "Running Shoes", "Lightweight daily trainers.", "89.00", 0),
    ("Books", "Two Scoops of Django", "Best practices for Django.", "45.00", 10),
]


class Command(BaseCommand):
    help = "Create a demo seller, categories and products for local development."

    @transaction.atomic
    def handle(self, *args, **options):
        User = get_user_model()
        seller, created = User.objects.get_or_create(
            username="demo_seller", defaults={"email": "seller@example.com"}
        )
        if created:
            seller.set_password("demo-pass-123")
            seller.save()

        for category_name, name, description, price, stock in DEMO_PRODUCTS:
            category, _ = Category.objects.get_or_create(name=category_name)
            Product.objects.get_or_create(
                seller=seller,
                name=name,
                defaults={
                    "category": category,
                    "description": description,
                    "price": Decimal(price),
                    "stock": stock,
                },
            )
        self.stdout.write(self.style.SUCCESS(
            "Demo data ready. Seller login: demo_seller / demo-pass-123"
        ))
