# Centralized Multi-Factory ERP Backend

Production-grade Django REST Framework backend with clean modular architecture and strict factory-scoped multi-tenancy.

Django code lives under **`backend/`**. There is **no** `manage.py` in the repository root; always use `backend\manage.py` (from the repo root) or `manage.py` after `cd backend`.

## 1) First-time setup

From the repository root (Windows PowerShell):

```powershell
python -m venv .venv
.\.venv\Scripts\activate
pip install -r backend\requirements.txt
cd backend
python manage.py migrate
python manage.py createsuperuser
```

Create new migrations when you change models:

```powershell
cd backend
python manage.py makemigrations
python manage.py migrate
```

## 2) Run the server

**Option A — from repo root (venv activated):**

```powershell
python backend\manage.py runserver
```

**Option B — from `backend` folder:**

```powershell
cd backend
python manage.py runserver
```

Then open [http://127.0.0.1:8000/api/docs/](http://127.0.0.1:8000/api/docs/) for Swagger UI.

## 3) App structure

```
backend/
  manage.py
  config/
  apps/
    core/
    accounts/
    factories/
    production/
    inventory/
    sales/
    procurement/
    finance/
    reports/
    dashboard/
```

Each app contains `models.py`, `serializers.py`, `services.py`, `views.py`, and `urls.py`.

## 4) Authentication

- JWT token endpoint: `POST /api/auth/token/`
- Refresh endpoint: `POST /api/auth/token/refresh/`
- Profile endpoint: `GET /api/auth/me/`

## 5) API documentation

- Swagger UI: `/api/docs/`
- ReDoc: `/api/redoc/`
- OpenAPI schema: `/api/schema/`

## 6) API examples

### Create production record

`POST /api/production/`

```json
{
  "product": "Widget A",
  "quantity": 120,
  "date": "2026-04-25"
}
```

### Dashboard data

`GET /api/dashboard/`

Returns:

- total production
- total sales
- total inventory
- total profit/loss
- daily trends (TruncDate + Sum)

## 7) CSV for production

- Import: `POST /api/production/import-csv/` (`file` upload)
- Export: `GET /api/production/export-csv/`

CSV columns: `product,quantity,date`
