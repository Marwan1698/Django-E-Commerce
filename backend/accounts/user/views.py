from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import generics, permissions, serializers, status
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    ChangePasswordSerializer,
    LoginSerializer,
    RegisterSerializer,
    UserSerializer,
)
from .tokens import (
    clear_refresh_cookie,
    get_refresh_cookie,
    issue_tokens,
    revoke_all_tokens,
    set_refresh_cookie,
)

AuthResponse = inline_serializer(
    "AuthResponse", {"access": serializers.CharField(), "user": UserSerializer()}
)
AccessResponse = inline_serializer("AccessResponse", {"access": serializers.CharField()})


class AuthView(APIView):
    permission_classes = [permissions.AllowAny]
    # JSON only: a cross-site HTML form can't send it, which blocks login CSRF.
    parser_classes = [JSONParser]


class RegisterView(AuthView):
    throttle_scope = "auth"

    @extend_schema(request=RegisterSerializer, responses={201: AuthResponse})
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return issue_tokens(Response(status=status.HTTP_201_CREATED), user)


class LoginView(AuthView):
    throttle_scope = "auth"

    @extend_schema(request=LoginSerializer, responses=AuthResponse)
    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        return issue_tokens(Response(), serializer.validated_data["user"])


class RefreshView(AuthView):
    """Exchange the refresh cookie for a new access token (and a rotated cookie)."""

    @extend_schema(request=None, responses={200: AccessResponse, 401: None})
    def post(self, request):
        serializer = TokenRefreshSerializer(data={"refresh": get_refresh_cookie(request) or ""})
        try:
            serializer.is_valid(raise_exception=True)
        except (TokenError, AuthenticationFailed, serializers.ValidationError):
            # Missing, expired, revoked, or the user was deactivated.
            response = Response(
                {"detail": "Session expired. Please log in again."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
            clear_refresh_cookie(response)
            return response
        response = Response({"access": serializer.validated_data["access"]})
        set_refresh_cookie(response, serializer.validated_data["refresh"])
        return response


class LogoutView(AuthView):
    @extend_schema(request=None, responses={204: None})
    def post(self, request):
        token = get_refresh_cookie(request)
        if token:
            try:
                RefreshToken(token).blacklist()
            except TokenError:
                pass  # already expired or revoked
        response = Response(status=status.HTTP_204_NO_CONTENT)
        clear_refresh_cookie(response)
        return response


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "patch"]

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_scope = "auth"

    @extend_schema(request=ChangePasswordSerializer, responses=AuthResponse)
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = request.user
        user.set_password(serializer.validated_data["new_password"])
        user.save(update_fields=["password"])
        # Sign out every other device, then hand this one a fresh pair.
        revoke_all_tokens(user)
        return issue_tokens(Response(), user)
