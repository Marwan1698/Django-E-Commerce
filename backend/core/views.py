from django.conf import settings
from django.db import connection
from django.http import FileResponse, Http404, JsonResponse
from django.views.decorators.cache import never_cache


def health(request):
    """Liveness + database check for the hosting platform."""
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1")
    return JsonResponse({"status": "ok"})


@never_cache
def spa_index(request, path=""):
    """Serve the React app's index.html so client-side routes work on reload."""
    index = settings.FRONTEND_DIST / "index.html"
    if not index.is_file():
        raise Http404("Frontend not built.")
    return FileResponse(index.open("rb"), content_type="text/html")
