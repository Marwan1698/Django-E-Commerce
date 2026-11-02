from rest_framework import serializers

from orders.order_item.serializers import OrderItemSerializer

from .order import Order


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    can_cancel = serializers.BooleanField(read_only=True)

    class Meta:
        model = Order
        fields = (
            "id", "status", "payment_method", "full_name", "phone_number",
            "shipping_address", "total", "items", "can_cancel", "created_at", "updated_at",
        )
        read_only_fields = fields


class CheckoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ("full_name", "phone_number", "shipping_address", "payment_method")
