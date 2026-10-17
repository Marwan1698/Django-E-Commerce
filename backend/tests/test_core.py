import pytest
from django.test import override_settings

pytestmark = pytest.mark.django_db


def test_health(api):
    assert api.get("/api/health/").json() == {"status": "ok"}


def test_spa_fallback_serves_index_for_client_routes(client, tmp_path):
    (tmp_path / "index.html").write_text("<div id=root></div>")
    with override_settings(FRONTEND_DIST=tmp_path):
        res = client.get("/orders/12")
        assert res.status_code == 200
        assert b"id=root" in b"".join(res.streaming_content)
        assert "no-cache" in res["Cache-Control"]


def test_unknown_api_routes_still_404(client, tmp_path):
    (tmp_path / "index.html").write_text("<div id=root></div>")
    with override_settings(FRONTEND_DIST=tmp_path):
        assert client.get("/api/nope/").status_code == 404


def test_spa_fallback_404_when_frontend_not_built(client, tmp_path):
    with override_settings(FRONTEND_DIST=tmp_path):
        assert client.get("/cart").status_code == 404
