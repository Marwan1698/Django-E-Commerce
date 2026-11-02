from rest_framework import serializers

from .category import Category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "slug")
        read_only_fields = ("id",)
        extra_kwargs = {"slug": {"required": False}}
