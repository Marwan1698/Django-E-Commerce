from decimal import Decimal

from django.db import transaction
from rest_framework.exceptions import ValidationError

from catalog.product.product import Product
from orders.cart.cart import Cart
from orders.order_item.order_item import OrderItem

from .order import Order


@transaction.atomic
def place_order(
    user, *, full_name, phone_number, shipping_address,
    payment_method=Order.PaymentMethod.CASH_ON_DELIVERY,
):
    """Turn the user's cart into an order.

    Product rows are locked so two buyers can't both take the last unit;
    stock is only reserved here, at checkout, not when adding to the cart.
    """
    cart = Cart.objects.filter(user=user).first()
    lines = list(cart.items.all()) if cart else []
    if not lines:
        raise ValidationError({"cart": "Your cart is empty."})

    products = Product.objects.select_for_update().in_bulk([line.product_id for line in lines])
    errors = []
    for line in lines:
        product = products[line.product_id]
        if not product.is_active:
            errors.append(f"{product.name} is no longer available.")
        elif product.stock < line.quantity:
            errors.append(f"Only {product.stock} of {product.name} left in stock.")
    if errors:
        raise ValidationError({"cart": errors})

    order = Order.objects.create(
        user=user,
        full_name=full_name,
        phone_number=phone_number,
        shipping_address=shipping_address,
        payment_method=payment_method,
        total=Decimal("0.00"),
    )
    order_items, total = [], Decimal("0.00")
    for line in lines:
        product = products[line.product_id]
        product.stock -= line.quantity
        order_items.append(OrderItem(
            order=order,
            product=product,
            product_name=product.name,
            unit_price=product.price,
            quantity=line.quantity,
        ))
        total += product.price * line.quantity
    Product.objects.bulk_update(products.values(), ["stock"])
    OrderItem.objects.bulk_create(order_items)
    order.total = total
    order.save(update_fields=["total"])
    cart.items.all().delete()
    return order


@transaction.atomic
def cancel_order(order):
    order = Order.objects.select_for_update().get(pk=order.pk)
    if not order.can_cancel:
        raise ValidationError({"status": "Only pending orders can be cancelled."})
    items = list(order.items.exclude(product=None))
    products = Product.objects.select_for_update().in_bulk([item.product_id for item in items])
    for item in items:
        products[item.product_id].stock += item.quantity
    Product.objects.bulk_update(products.values(), ["stock"])
    order.status = Order.Status.CANCELLED
    order.save(update_fields=["status", "updated_at"])
    return order
