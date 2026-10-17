from decimal import Decimal

import pytest
from rest_framework.test import APIClient

from accounts.models import User
from catalog.models import Category, Product


@pytest.fixture
def make_user(db):
    def _make(username="alice", **extra):
        return User.objects.create_user(
            username=username,
            email=extra.pop("email", f"{username}@example.com"),
            password=extra.pop("password", "S3cure-pass!"),
            **extra,
        )
    return _make


@pytest.fixture
def api():
    return APIClient()


@pytest.fixture
def auth_api(make_user):
    def _client(user=None):
        client = APIClient()
        client.force_authenticate(user or make_user())
        return client
    return _client


@pytest.fixture
def category(db):
    return Category.objects.create(name="Electronics")


@pytest.fixture
def make_product(make_user, category):
    default_seller = None

    def _make(seller=None, **extra):
        nonlocal default_seller
        if seller is None:
            default_seller = default_seller or make_user("seller")
            seller = default_seller
        defaults = {"name": "Laptop", "price": Decimal("100.00"), "stock": 5}
        defaults.update(extra)
        return Product.objects.create(
            seller=seller, category=category, **defaults
        )
    return _make
