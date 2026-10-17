from django.conf import settings
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.static import serve
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from core.views import health, spa_index

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health, name="health"),
    path("api/auth/", include("accounts.urls")),
    path("api/", include("catalog.urls")),
    path("api/", include("orders.urls")),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="docs"),
]

if not settings.USE_S3_MEDIA:
    # Local uploads (development, or a demo without object storage).
    urlpatterns += [
        re_path(r"^media/(?P<path>.*)$", serve, {"document_root": settings.MEDIA_ROOT}),
    ]

# Everything else is a React route.
urlpatterns += [
    re_path(r"^(?!api/|admin/|static/|media/)(?P<path>.*)$", spa_index, name="spa"),
]
