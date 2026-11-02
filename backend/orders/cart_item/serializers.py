from rest_framework import serializers

from catalog.product.product import Product
from catalog.product.serializers import ProductSerializer

from .cart_item import CartItem


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    line_total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = ("id", "product", "quantity", "line_total")


class AddCartItemSerializer(serializers.Serializer):
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_active=True), source="product"
    )
    quantity = serializers.IntegerField(min_value=1, default=1)

    def validate(self, attrs):
        product, user = attrs["product"], self.context["request"].user
        if product.seller_id == user.id:
            raise serializers.ValidationError("You cannot buy your own product.")
        existing = CartItem.objects.filter(cart__user=user, product=product).first()
        wanted = attrs["quantity"] + (existing.quantity if existing else 0)
        if wanted > product.stock:
            raise serializers.ValidationError(
                f"Only {product.stock} of {product.name} left in stock."
            )
        return attrs


class UpdateCartItemSerializer(serializers.ModelSerializer):
    quantity = serializers.IntegerField(min_value=1)

    class Meta:
        model = CartItem
        fields = ("quantity",)

    def validate_quantity(self, value):
        product = self.instance.product
        if value > product.stock:
            raise serializers.ValidationError(
                f"Only {product.stock} of {product.name} left in stock."
            )
        return value
