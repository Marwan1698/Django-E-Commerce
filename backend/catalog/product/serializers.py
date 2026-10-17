from django.conf import settings
from rest_framework import serializers

from catalog.category.category import Category
from catalog.category.serializers import CategorySerializer

from .product import Product


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source="category", write_only=True
    )
    seller = serializers.CharField(source="seller.username", read_only=True)
    in_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = (
            "id", "name", "description", "price", "stock", "in_stock", "image",
            "is_active", "category", "category_id", "seller", "created_at", "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def validate_image(self, image):
        if image and image.size > settings.MAX_UPLOAD_IMAGE_SIZE:
            limit_mb = settings.MAX_UPLOAD_IMAGE_SIZE // (1024 * 1024)
            raise serializers.ValidationError(f"Image must be at most {limit_mb} MB.")
        return image
