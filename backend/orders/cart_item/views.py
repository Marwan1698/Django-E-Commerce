from django.db.models import F
from drf_spectacular.utils import extend_schema
from rest_framework import mixins, permissions, status, viewsets

from orders.cart.serializers import CartSerializer
from orders.cart.views import cart_response, get_cart

from .cart_item import CartItem
from .serializers import AddCartItemSerializer, UpdateCartItemSerializer


class CartItemViewSet(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """Add / change / remove lines in the current user's cart. Every call returns the cart."""

    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["post", "patch", "delete"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return CartItem.objects.none()
        return CartItem.objects.filter(cart__user=self.request.user).select_related("product")

    def get_serializer_class(self):
        return AddCartItemSerializer if self.action == "create" else UpdateCartItemSerializer

    @extend_schema(responses={201: CartSerializer})
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cart = get_cart(request.user)
        product, quantity = serializer.validated_data["product"], serializer.validated_data["quantity"]
        item, created = CartItem.objects.get_or_create(
            cart=cart, product=product, defaults={"quantity": quantity}
        )
        if not created:
            CartItem.objects.filter(pk=item.pk).update(quantity=F("quantity") + quantity)
        return cart_response(request.user, status.HTTP_201_CREATED)

    @extend_schema(responses=CartSerializer)
    def partial_update(self, request, *args, **kwargs):
        super().partial_update(request, *args, **kwargs)
        return cart_response(request.user)

    @extend_schema(responses=CartSerializer)
    def destroy(self, request, *args, **kwargs):
        super().destroy(request, *args, **kwargs)
        return cart_response(request.user)
