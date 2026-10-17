from drf_spectacular.utils import extend_schema
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .cart import Cart
from .serializers import CartSerializer


def get_cart(user):
    cart, _ = Cart.objects.get_or_create(user=user)
    return Cart.objects.prefetch_related("items__product__category").get(pk=cart.pk)


def cart_response(user, status_code=status.HTTP_200_OK):
    return Response(CartSerializer(get_cart(user)).data, status=status_code)


class CartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(responses=CartSerializer)
    def get(self, request):
        return cart_response(request.user)

    @extend_schema(responses=CartSerializer)
    def delete(self, request):
        """Empty the cart."""
        get_cart(request.user).items.all().delete()
        return cart_response(request.user)
