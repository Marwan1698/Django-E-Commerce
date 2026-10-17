# eStore

**Buy and sell, all in one place.** eStore is an open marketplace: anyone
can browse, and signed-in users can list their own products, add other
people's products to a cart and check out.

(Formerly "South Side", the original Django-templates version on `main`.)

- **`backend/`**: Django 5.2 LTS + Django REST Framework JSON API
- **`frontend/`**: React + Vite single-page app (JavaScript, function components)

Deploying for free (Render + Neon): see **[DEPLOY.md](DEPLOY.md)**.

## Running locally

Start the backend (below), then in a second terminal:

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173 (forwards /api and /media to Django on :8000)
```

Frontend checks: `npm run lint`, `npm test`, `npm run build`.

### Frontend layout

Like the backend, the frontend is organised by model. Each model folder holds
its data hooks (`api.js`), its reusable `components/` and its `scenes/`
(full pages that routes point to):

```
frontend/src/
├── app/                 App, routes, Layout, Navbar
├── shared/              API client, helpers, UI kit (Button, Card, Field…), NotFound scene
└── models/
    ├── user/            api.js · schemas.js · components/ (AuthProvider, forms…) · scenes/ (Login, Register, Account)
    ├── category/        api.js · components/ (CategoryPills) · scenes/ (Category)
    ├── product/         api.js · components/ (ProductCard, ProductBrowser, ProductForm…) · scenes/ (Shop, ProductDetail, MyProducts, ProductEditor)
    ├── cart/            api.js · components/ (AddToCartForm, CartLine, CartSummary…) · scenes/ (Cart)
    └── order/           api.js · components/ (CheckoutForm, OrderItemsTable, StatusBadge) · scenes/ (Checkout, Orders, OrderDetail)
```

Cart and order *items* have no pages of their own, so their UI lives with
the parent model (`cart/`, `order/`).

The theme is defined once in `src/index.css`: white surfaces, cool greys
(Tailwind `slate`) and a custom dark blue `navy` scale, with rounded,
pill-shaped controls throughout.

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
| `/api/auth/register/` | POST | Creates the account; returns `{access, user}` + refresh cookie |
| `/api/auth/login/` | POST | `login` (username **or** email) + `password`; same response |
| `/api/auth/refresh/` | POST | New access token from the refresh cookie (rotated); 204 if no session |
| `/api/auth/logout/` | POST | Revokes the refresh token and clears the cookie |
| `/api/auth/me/` | GET, PATCH | Current user profile |
| `/api/auth/change-password/` | POST | Signs out all other devices; returns a new token pair |
| `/api/health/` | GET | Health check for the host |
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

### Authentication (JWT)

- **Access token** (10 min): returned in the JSON body. The SPA keeps it only
  in memory and sends it as `Authorization: Bearer <token>`.
- **Refresh token** (7 days): set as an `httpOnly`, `Secure`, `SameSite=Lax`
  cookie limited to `/api/auth/`, so JavaScript, and therefore an XSS attack,
  can never read it. It is rotated on every refresh, and the old token is
  blacklisted.
- On page load, and whenever a request gets a 401, the SPA calls
  `/api/auth/refresh/` once and retries the request.
- Auth endpoints accept JSON only (which blocks cross-site form posts) and are
  rate-limited.

### Configuration

All secrets and environment-specific values come from environment variables
(see `backend/.env.example`). `config.settings.prod` refuses to start without
`DJANGO_SECRET_KEY` and enables secure cookies, HSTS and SSL redirect.
Use `DATABASE_URL` for Postgres/MySQL, and install the matching driver.
