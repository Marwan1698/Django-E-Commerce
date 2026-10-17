# Django E-Commerce (v2)

A marketplace-style store: anyone can browse, signed-in users can sell their own
products, add others' products to a cart and check out.

v2 is a rewrite of the original Django-templates app into:

- **`backend/`**: Django 5.2 LTS + Django REST Framework JSON API
- **`frontend/`**: React + Vite single-page app *(in progress)*

## Backend

### Quick start

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env            # edit as needed; SQLite is used by default
python manage.py migrate
python manage.py seed_demo      # optional demo seller, categories and products
python manage.py createsuperuser
python manage.py runserver
```

- API docs (Swagger): http://localhost:8000/api/docs/
- Admin: http://localhost:8000/admin/
- Tests: `pytest`

### Project layout

Each domain app keeps one folder per model, holding the model, its
serializers and its views:

```
backend/
├── config/                 # settings/{base,dev,test,prod}.py, urls, wsgi/asgi
├── core/permissions.py     # shared DRF permissions
├── accounts/
│   └── user/               # user.py · serializers.py · views.py
├── catalog/
│   ├── category/           # category.py · serializers.py · views.py
│   └── product/            # product.py · serializers.py · views.py · filters.py
└── orders/
    ├── cart/               # cart.py · serializers.py · views.py
    ├── cart_item/          # cart_item.py · serializers.py · views.py
    ├── order/              # order.py · serializers.py · views.py · services.py
    └── order_item/         # order_item.py · serializers.py
```

Each app's `models.py` only re-exports the models so Django can discover them.

### API overview

| Endpoint | Methods | Notes |
|---|---|---|
| `/api/auth/csrf/` | GET | Sets the `csrftoken` cookie; call once on app start |
| `/api/auth/register/` | POST | Creates the account and logs in |
| `/api/auth/login/` | POST | `login` (username **or** email) + `password` |
| `/api/auth/logout/` | POST | |
| `/api/auth/me/` | GET, PATCH | Current user profile |
| `/api/auth/change-password/` | POST | |
| `/api/categories/` | GET (all), write (staff) | Looked up by `slug` |
| `/api/products/` | GET (all), POST (auth) | Filters: `category`, `min_price`, `max_price`, `in_stock`, `search`, `ordering` |
| `/api/products/{id}/` | GET, PATCH, PUT, DELETE | Only the seller (or staff) can modify |
| `/api/products/mine/` | GET | The current user's listings, incl. inactive |
| `/api/cart/` | GET, DELETE | Current cart / empty it |
| `/api/cart/items/` | POST | `product_id`, `quantity`; returns the cart |
| `/api/cart/items/{id}/` | PATCH, DELETE | Returns the cart |
| `/api/orders/` | GET, POST | POST = checkout from the cart |
| `/api/orders/{id}/` | GET | Own orders only |
| `/api/orders/{id}/cancel/` | POST | Pending orders only; restores stock |

### Authentication

Session cookies + CSRF. The React app is served from the same origin (Vite
proxies `/api` in development), sends `credentials: "include"`, and echoes the
`csrftoken` cookie in an `X-CSRFToken` header on unsafe requests. Auth endpoints
are rate-limited.

### Configuration

All secrets and environment-specific values come from environment variables
(see `backend/.env.example`). `config.settings.prod` refuses to start without
`DJANGO_SECRET_KEY` and enables secure cookies, HSTS and SSL redirect.
Use `DATABASE_URL` for Postgres/MySQL, and install the matching driver.
