import pytest
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db


def test_register_logs_in_and_hides_password(api):
    res = api.post("/api/auth/register/", {
        "username": "bob", "email": "Bob@Example.com", "password": "S3cure-pass!",
    })
    assert res.status_code == 201, res.data
    assert res.data["email"] == "bob@example.com"
    assert "password" not in res.data
    assert api.get("/api/auth/me/").data["username"] == "bob"


def test_register_rejects_weak_password_and_duplicate_email(api, make_user):
    make_user("alice")
    res = api.post("/api/auth/register/", {
        "username": "bob", "email": "ALICE@example.com", "password": "123",
    })
    assert res.status_code == 400
    assert "email" in res.data


@pytest.mark.parametrize("login", ["alice", "alice@example.com"])
def test_login_with_username_or_email(api, make_user, login):
    make_user("alice")
    res = api.post("/api/auth/login/", {"login": login, "password": "S3cure-pass!"})
    assert res.status_code == 200
    assert res.data["username"] == "alice"


def test_login_wrong_password(api, make_user):
    make_user("alice")
    res = api.post("/api/auth/login/", {"login": "alice", "password": "nope"})
    assert res.status_code == 400


def test_login_requires_csrf_token():
    client = APIClient(enforce_csrf_checks=True)
    res = client.post("/api/auth/login/", {"login": "x", "password": "y"})
    assert res.status_code == 403

    client.get("/api/auth/csrf/")
    token = client.cookies["csrftoken"].value
    res = client.post("/api/auth/login/", {"login": "x", "password": "y"}, HTTP_X_CSRFTOKEN=token)
    assert res.status_code == 400  # past CSRF, rejected on credentials


def test_me_requires_auth_and_cannot_escalate(api, auth_api):
    assert api.get("/api/auth/me/").status_code == 403
    client = auth_api()
    res = client.patch("/api/auth/me/", {"address": "1 Nile St", "is_staff": True})
    assert res.status_code == 200
    assert res.data["address"] == "1 Nile St"
    assert res.data["is_staff"] is False


def test_change_password(make_user):
    user = make_user("alice")
    client = APIClient()
    client.force_login(user)
    res = client.post("/api/auth/change-password/", {
        "current_password": "S3cure-pass!", "new_password": "An0ther-pass!",
    })
    assert res.status_code == 204
    user.refresh_from_db()
    assert user.check_password("An0ther-pass!")
