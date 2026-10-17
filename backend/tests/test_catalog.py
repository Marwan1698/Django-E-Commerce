import pytest

pytestmark = pytest.mark.django_db


def test_public_list_hides_inactive_products(api, make_product):
    make_product(name="Visible")
    make_product(name="Hidden", is_active=False)
    res = api.get("/api/products/")
    assert [p["name"] for p in res.data["results"]] == ["Visible"]


def test_filters_and_search(api, make_product):
    make_product(name="Cheap mouse", price="10.00")
    make_product(name="Pricey laptop", price="900.00", stock=0)
    assert api.get("/api/products/?max_price=50").data["count"] == 1
    assert api.get("/api/products/?search=laptop").data["count"] == 1
    assert api.get("/api/products/?in_stock=true").data["count"] == 1
    assert api.get("/api/products/?category=electronics").data["count"] == 2


def test_anonymous_cannot_create(api, category):
    res = api.post("/api/products/", {"name": "x", "price": "1", "category_id": category.id})
    assert res.status_code == 403


def test_create_sets_seller_from_session(auth_api, make_user, category):
    me = make_user("me")
    res = auth_api(me).post("/api/products/", {
        "name": "Hoodie", "price": "39.90", "stock": 3, "category_id": category.id,
    })
    assert res.status_code == 201, res.data
    assert res.data["seller"] == "me"


def test_only_owner_can_edit_or_delete(auth_api, make_user, make_product):
    owner = make_user("owner")
    product = make_product(seller=owner)
    stranger = auth_api(make_user("stranger"))
    assert stranger.patch(f"/api/products/{product.id}/", {"price": "1"}).status_code == 403
    assert stranger.delete(f"/api/products/{product.id}/").status_code == 403

    client = auth_api(owner)
    assert client.patch(f"/api/products/{product.id}/", {"price": "1.50"}).data["price"] == "1.50"
    assert client.delete(f"/api/products/{product.id}/").status_code == 204


def test_negative_price_rejected(auth_api, category):
    res = auth_api().post("/api/products/", {"name": "x", "price": "-1", "category_id": category.id})
    assert res.status_code == 400


def test_mine_lists_own_products_including_inactive(auth_api, make_user, make_product):
    me = make_user("me")
    make_product(seller=me, name="Mine", is_active=False)
    make_product(name="Theirs")
    res = auth_api(me).get("/api/products/mine/")
    assert [p["name"] for p in res.data["results"]] == ["Mine"]


def test_missing_product_is_404(api):
    assert api.get("/api/products/999/").status_code == 404


def test_only_staff_manage_categories(auth_api, make_user):
    assert auth_api().post("/api/categories/", {"name": "Books"}).status_code == 403
    staff = make_user("admin", is_staff=True)
    res = auth_api(staff).post("/api/categories/", {"name": "Home & Garden"})
    assert res.status_code == 201
    assert res.data["slug"] == "home-garden"
