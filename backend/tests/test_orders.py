from decimal import Decimal

import pytest

from catalog.models import Product
from orders.models import Order

pytestmark = pytest.mark.django_db

CHECKOUT = {
    "full_name": "Alice Doe",
    "phone_number": "+201001234567",
    "shipping_address": "1 Nile St, Cairo",
    "payment_method": "cash_on_delivery",
}


def test_cart_requires_auth(api):
    assert api.get("/api/cart/").status_code == 401


def test_add_update_remove_cart_items(auth_api, make_product):
    client = auth_api()
    product = make_product(price=Decimal("10.00"), stock=5)

    res = client.post("/api/cart/items/", {"product_id": product.id, "quantity": 2})
    assert res.status_code == 201
    res = client.post("/api/cart/items/", {"product_id": product.id})
    assert res.data["item_count"] == 3
    assert res.data["total"] == "30.00"

    item_id = res.data["items"][0]["id"]
    assert client.patch(f"/api/cart/items/{item_id}/", {"quantity": 1}).data["total"] == "10.00"
    assert client.delete(f"/api/cart/items/{item_id}/").data["items"] == []

    product.refresh_from_db()
    assert product.stock == 5  # adding to cart never reserves stock


def test_cannot_add_more_than_stock(auth_api, make_product):
    client = auth_api()
    product = make_product(stock=2)
    client.post("/api/cart/items/", {"product_id": product.id, "quantity": 2})
    res = client.post("/api/cart/items/", {"product_id": product.id})
    assert res.status_code == 400


def test_cannot_buy_own_or_inactive_product(auth_api, make_user, make_product):
    me = make_user("me")
    client = auth_api(me)
    own = make_product(seller=me)
    inactive = make_product(is_active=False)
    assert client.post("/api/cart/items/", {"product_id": own.id}).status_code == 400
    assert client.post("/api/cart/items/", {"product_id": inactive.id}).status_code == 400


def test_cannot_touch_someone_elses_cart_item(auth_api, make_user, make_product):
    product = make_product()
    alice = auth_api(make_user("alice"))
    item_id = alice.post("/api/cart/items/", {"product_id": product.id}).data["items"][0]["id"]
    mallory = auth_api(make_user("mallory"))
    assert mallory.delete(f"/api/cart/items/{item_id}/").status_code == 404


def test_checkout_snapshots_prices_and_decrements_stock(auth_api, make_product):
    client = auth_api()
    product = make_product(price=Decimal("25.00"), stock=5)
    client.post("/api/cart/items/", {"product_id": product.id, "quantity": 2})

    res = client.post("/api/orders/", CHECKOUT)
    assert res.status_code == 201, res.data
    assert res.data["total"] == "50.00"
    assert res.data["status"] == "pending"

    product.refresh_from_db()
    assert product.stock == 3
    assert client.get("/api/cart/").data["items"] == []

    # Later price changes don't rewrite history.
    Product.objects.filter(pk=product.pk).update(price=Decimal("999.00"))
    order = client.get(f"/api/orders/{res.data['id']}/").data
    assert order["items"][0]["unit_price"] == "25.00"
    assert order["total"] == "50.00"


def test_checkout_fails_cleanly_when_stock_ran_out(auth_api, make_product):
    client = auth_api()
    product = make_product(stock=2)
    client.post("/api/cart/items/", {"product_id": product.id, "quantity": 2})
    Product.objects.filter(pk=product.pk).update(stock=1)  # someone else bought one

    res = client.post("/api/orders/", CHECKOUT)
    assert res.status_code == 400
    assert Order.objects.count() == 0
    product.refresh_from_db()
    assert product.stock == 1


def test_checkout_defaults_to_cash_on_delivery(auth_api, make_product):
    client = auth_api()
    client.post("/api/cart/items/", {"product_id": make_product().id})
    data = {k: v for k, v in CHECKOUT.items() if k != "payment_method"}
    res = client.post("/api/orders/", data)
    assert res.status_code == 201, res.data
    assert res.data["payment_method"] == "cash_on_delivery"


def test_checkout_with_empty_cart(auth_api):
    assert auth_api().post("/api/orders/", CHECKOUT).status_code == 400


def test_checkout_validates_phone(auth_api, make_product):
    client = auth_api()
    client.post("/api/cart/items/", {"product_id": make_product().id})
    res = client.post("/api/orders/", {**CHECKOUT, "phone_number": "abc"})
    assert res.status_code == 400
    assert "phone_number" in res.data


def test_card_payment_is_not_accepted(auth_api, make_product):
    client = auth_api()
    client.post("/api/cart/items/", {"product_id": make_product().id})
    res = client.post("/api/orders/", {**CHECKOUT, "payment_method": "credit_card"})
    assert res.status_code == 400


def test_cancel_restores_stock_once(auth_api, make_product):
    client = auth_api()
    product = make_product(stock=5)
    client.post("/api/cart/items/", {"product_id": product.id, "quantity": 3})
    order_id = client.post("/api/orders/", CHECKOUT).data["id"]

    res = client.post(f"/api/orders/{order_id}/cancel/")
    assert res.data["status"] == "cancelled"
    assert client.post(f"/api/orders/{order_id}/cancel/").status_code == 400
    product.refresh_from_db()
    assert product.stock == 5


def test_users_only_see_their_own_orders(auth_api, make_user, make_product):
    alice = auth_api(make_user("alice"))
    alice.post("/api/cart/items/", {"product_id": make_product().id})
    order_id = alice.post("/api/orders/", CHECKOUT).data["id"]

    mallory = auth_api(make_user("mallory"))
    assert mallory.get("/api/orders/").data["count"] == 0
    assert mallory.get(f"/api/orders/{order_id}/").status_code == 404
    assert mallory.post(f"/api/orders/{order_id}/cancel/").status_code == 404
