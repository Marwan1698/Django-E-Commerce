from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser

from core.permissions import IsOwnerOrStaff

from .filters import ProductFilter
from .product import Product
from .serializers import ProductSerializer


class ProductViewSet(viewsets.ModelViewSet):
    """Public catalog; signed-in users can sell, and only edit their own products."""

    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrStaff]
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    filterset_class = ProductFilter
    search_fields = ["name", "description"]
    ordering_fields = ["price", "created_at", "name"]
    owner_field = "seller"

    def get_queryset(self):
        qs = Product.objects.select_related("category", "seller")
        if getattr(self, "swagger_fake_view", False):
            return qs.none()
        if self.action == "mine":
            return qs.filter(seller=self.request.user)
        if self.action == "list":
            return qs.filter(is_active=True)
        # Detail routes: active products for everyone, plus the caller's own.
        user = self.request.user
        if user.is_staff:
            return qs
        if user.is_authenticated:
            return qs.filter(is_active=True) | qs.filter(seller=user)
        return qs.filter(is_active=True)

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)

    @action(detail=False, permission_classes=[permissions.IsAuthenticated])
    def mine(self, request):
        """Products the current user is selling (including inactive ones)."""
        return self.list(request)
