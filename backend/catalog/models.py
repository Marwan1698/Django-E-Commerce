# Models live in per-model folders; import them here so Django registers them.
from .category.category import Category
from .product.product import Product

__all__ = ["Category", "Product"]
