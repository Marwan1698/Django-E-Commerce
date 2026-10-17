from rest_framework import viewsets

from core.permissions import IsStaffOrReadOnly

from .category import Category
from .serializers import CategorySerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsStaffOrReadOnly]
    pagination_class = None
    lookup_field = "slug"
