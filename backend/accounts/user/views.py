from django.contrib.auth import login, logout, update_session_auth_hash
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from drf_spectacular.utils import extend_schema
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    ChangePasswordSerializer,
    LoginSerializer,
    RegisterSerializer,
    UserSerializer,
)


@method_decorator(ensure_csrf_cookie, name="get")
class CsrfView(APIView):
    """Sets the csrftoken cookie; the SPA calls this once on start-up."""

    permission_classes = [permissions.AllowAny]

    @extend_schema(responses={204: None})
    def get(self, request):
        return Response(status=status.HTTP_204_NO_CONTENT)


# DRF only enforces CSRF for authenticated sessions, so the anonymous
# login/register endpoints opt in explicitly.
@method_decorator(csrf_protect, name="post")
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    throttle_scope = "auth"

    def perform_create(self, serializer):
        user = serializer.save()
        login(self.request, user)

    def create(self, request, *args, **kwargs):
        super().create(request, *args, **kwargs)
        return Response(UserSerializer(request.user).data, status=status.HTTP_201_CREATED)


@method_decorator(csrf_protect, name="post")
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_scope = "auth"

    @extend_schema(request=LoginSerializer, responses=UserSerializer)
    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        login(request, serializer.validated_data["user"])
        return Response(UserSerializer(request.user).data)


class LogoutView(APIView):
    @extend_schema(request=None, responses={204: None})
    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "patch"]

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_scope = "auth"

    @extend_schema(request=ChangePasswordSerializer, responses={204: None})
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save(update_fields=["password"])
        update_session_auth_hash(request, request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)
