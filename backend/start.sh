#!/bin/sh
# Container entrypoint: migrate, optionally create the first admin, serve.
set -e

python manage.py migrate --noinput

# Free hosts often have no shell, so the first superuser comes from env vars
# (DJANGO_SUPERUSER_USERNAME / _EMAIL / _PASSWORD). Safe to leave set.
if [ -n "$DJANGO_SUPERUSER_USERNAME" ]; then
  python manage.py createsuperuser --noinput 2>/dev/null || true
fi

exec gunicorn config.wsgi:application \
  --bind "0.0.0.0:${PORT:-8000}" \
  --workers "${WEB_CONCURRENCY:-2}" \
  --timeout 60 \
  --access-logfile -
