from drf_spectacular.utils import extend_schema
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .order import Order
from .serializers import CheckoutSerializer, OrderSerializer
from .services import cancel_order, place_order


class OrderViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderSerializer
    filterset_fields = ["status"]
    ordering_fields = ["created_at", "total"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Order.objects.none()
        # Users only ever see their own orders.
        return Order.objects.filter(user=self.request.user).prefetch_related("items")

    @extend_schema(request=CheckoutSerializer, responses={201: OrderSerializer})
    def create(self, request, *args, **kwargs):
        """Checkout: create an order from the current cart."""
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = place_order(request.user, **serializer.validated_data)
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

    @extend_schema(request=None, responses=OrderSerializer)
    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        order = cancel_order(self.get_object())
        return Response(OrderSerializer(order).data)
