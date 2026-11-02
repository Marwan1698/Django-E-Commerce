import pytest
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db

REFRESH_COOKIE = "refresh_token"


def login(client, login="alice", password="S3cure-pass!"):
    return client.post("/api/auth/login/", {"login": login, "password": password}, format="json")


def bearer(access):
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
    return client


def test_register_returns_tokens_and_hides_password(api):
    res = api.post("/api/auth/register/", {
        "username": "bob", "email": "Bob@Example.com", "password": "S3cure-pass!",
    }, format="json")
    assert res.status_code == 201, res.data
    assert res.data["user"]["email"] == "bob@example.com"
    assert "password" not in res.data["user"]
    assert res.cookies[REFRESH_COOKIE]["httponly"]
    assert bearer(res.data["access"]).get("/api/auth/me/").data["username"] == "bob"


def test_register_rejects_weak_password_and_duplicate_email(api, make_user):
    make_user("alice")
    res = api.post("/api/auth/register/", {
        "username": "bob", "email": "ALICE@example.com", "password": "123",
    }, format="json")
    assert res.status_code == 400
    assert "email" in res.data


@pytest.mark.parametrize("identifier", ["alice", "alice@example.com"])
def test_login_with_username_or_email(api, make_user, identifier):
    make_user("alice")
    res = login(api, identifier)
    assert res.status_code == 200
    assert res.data["user"]["username"] == "alice"
    assert res.data["access"]
    cookie = res.cookies[REFRESH_COOKIE]
    assert cookie["httponly"] and cookie["path"] == "/api/auth/"
    assert REFRESH_COOKIE not in res.data  # never exposed to JavaScript


def test_login_wrong_password(api, make_user):
    make_user("alice")
    assert login(api, password="nope").status_code == 400


def test_login_rejects_form_posts(api, make_user):
    """Cross-site HTML forms can't send JSON, so they can't log a victim in."""
    make_user("alice")
    res = api.post("/api/auth/login/", {"login": "alice", "password": "S3cure-pass!"})
    assert res.status_code == 415


def test_refresh_rotates_and_old_token_is_revoked(api, make_user):
    make_user("alice")
    login(api)
    old_refresh = api.cookies[REFRESH_COOKIE].value

    res = api.post("/api/auth/refresh/")
    assert res.status_code == 200
    assert bearer(res.data["access"]).get("/api/auth/me/").status_code == 200
    assert api.cookies[REFRESH_COOKIE].value != old_refresh

    replay = APIClient()
    replay.cookies[REFRESH_COOKIE] = old_refresh
    assert replay.post("/api/auth/refresh/").status_code == 401


def test_refresh_without_cookie_is_a_no_op(api):
    res = api.post("/api/auth/refresh/")
    assert res.status_code == 204
    assert REFRESH_COOKIE not in res.cookies


def test_refresh_with_garbage_cookie_clears_it(api):
    api.cookies[REFRESH_COOKIE] = "garbage"
    res = api.post("/api/auth/refresh/")
    assert res.status_code == 401
    assert res.cookies[REFRESH_COOKIE].value == ""


def test_logout_revokes_refresh_token(api, make_user):
    make_user("alice")
    login(api)
    refresh = api.cookies[REFRESH_COOKIE].value
    assert api.post("/api/auth/logout/").status_code == 204
    assert api.cookies[REFRESH_COOKIE].value == ""

    replay = APIClient()
    replay.cookies[REFRESH_COOKIE] = refresh
    assert replay.post("/api/auth/refresh/").status_code == 401


def test_invalid_access_token_is_rejected():
    assert bearer("not-a-token").get("/api/auth/me/").status_code == 401


def test_me_requires_auth_and_cannot_escalate(api, auth_api):
    assert api.get("/api/auth/me/").status_code == 401
    client = auth_api()
    res = client.patch("/api/auth/me/", {"address": "1 Nile St", "is_staff": True})
    assert res.status_code == 200
    assert res.data["address"] == "1 Nile St"
    assert res.data["is_staff"] is False


def test_change_password_signs_out_other_devices(make_user):
    user = make_user("alice")
    laptop, phone = APIClient(), APIClient()
    login(laptop)
    login(phone)

    access = laptop.post("/api/auth/refresh/").data["access"]
    laptop.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
    res = laptop.post("/api/auth/change-password/", {
        "current_password": "S3cure-pass!", "new_password": "An0ther-pass!",
    }, format="json")
    assert res.status_code == 200
    user.refresh_from_db()
    assert user.check_password("An0ther-pass!")

    assert phone.post("/api/auth/refresh/").status_code == 401  # other device signed out
    assert laptop.post("/api/auth/refresh/").status_code == 200  # this one got a new pair
