from rest_framework.routers import DefaultRouter

from .category.views import CategoryViewSet
from .product.views import ProductViewSet

router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="category")
router.register("products", ProductViewSet, basename="product")

urlpatterns = router.urls
