from django.urls import path
from rest_framework.routers import DefaultRouter

from .cart.views import CartView
from .cart_item.views import CartItemViewSet
from .order.views import OrderViewSet

router = DefaultRouter()
router.register("cart/items", CartItemViewSet, basename="cart-item")
router.register("orders", OrderViewSet, basename="order")

urlpatterns = [
    path("cart/", CartView.as_view(), name="cart"),
] + router.urls
