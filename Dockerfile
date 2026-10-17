# One image: build the React app, then serve it and the API from Django.

FROM node:22-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM python:3.13-slim
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=config.settings.prod \
    FRONTEND_DIST=/app/frontend/dist
WORKDIR /app/backend

COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./
COPY --from=frontend /app/frontend/dist /app/frontend/dist
RUN DJANGO_SECRET_KEY=collectstatic-only python manage.py collectstatic --noinput \
 && useradd --create-home app && mkdir -p media && chown -R app /app
USER app

EXPOSE 8000
CMD ["./start.sh"]
