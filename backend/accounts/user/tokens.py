from django.conf import settings
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import UserSerializer


def set_refresh_cookie(response, refresh):
    cookie = settings.JWT_REFRESH_COOKIE
    response.set_cookie(
        cookie["key"],
        str(refresh),
        max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()),
        path=cookie["path"],
        httponly=cookie["httponly"],
        secure=cookie["secure"],
        samesite=cookie["samesite"],
    )


def clear_refresh_cookie(response):
    cookie = settings.JWT_REFRESH_COOKIE
    response.delete_cookie(cookie["key"], path=cookie["path"], samesite=cookie["samesite"])


def get_refresh_cookie(request):
    return request.COOKIES.get(settings.JWT_REFRESH_COOKIE["key"])


def issue_tokens(response, user):
    """Attach a fresh token pair: access + user in the body, refresh in the cookie."""
    refresh = RefreshToken.for_user(user)
    response.data = {"access": str(refresh.access_token), "user": UserSerializer(user).data}
    set_refresh_cookie(response, refresh)
    return response


def revoke_all_tokens(user):
    """Blacklist every outstanding refresh token, signing the user out everywhere."""
    for token in OutstandingToken.objects.filter(user=user):
        BlacklistedToken.objects.get_or_create(token=token)
