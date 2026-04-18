# Deployment Guide

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 20+ | https://nodejs.org |
| Python | 3.11+ | https://python.org |
| Docker | Latest | https://docker.com |
| Docker Compose | v2+ | Included with Docker Desktop |
| Supabase CLI | Latest | `npm i -g supabase` |

---

## 1. Supabase Setup

### 1.1 Create a Project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New Project**, choose your organisation and region.
3. Set a strong database password and save it.
4. Wait for the project to provision (~2 minutes).

### 1.2 Collect Credentials

From **Project Settings → API**:

```
SUPABASE_URL        = https://<project-ref>.supabase.co
SUPABASE_ANON_KEY   = eyJ...  (anon / public key)
SUPABASE_SERVICE_KEY = eyJ... (service_role / secret key — keep private)
```

### 1.3 Enable Row-Level Security

MediVault enforces RLS at the application layer via SQLAlchemy user-scoped queries.
If you expose Supabase tables directly (e.g., via Supabase JS client), enable RLS on every table:

```sql
-- Example for problems table
ALTER TABLE problem_diagnoses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own records"
  ON problem_diagnoses
  FOR ALL
  USING (user_id = auth.uid());
```

### 1.4 Create the Storage Bucket

1. Go to **Storage** in the Supabase dashboard.
2. Click **New bucket**, name it `medivault`.
3. Set it to **Private** (not public).
4. Under **Policies**, add a policy:

```sql
-- Allow authenticated users to manage their own files
CREATE POLICY "User-scoped storage"
  ON storage.objects
  FOR ALL
  USING (auth.uid()::text = (storage.foldername(name))[1]);
```

---

## 2. Local Development

### 2.1 Clone & Configure

```bash
git clone https://github.com/realash24/medivault.git
cd medivault
```

### 2.2 Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```dotenv
DATABASE_URL=postgresql+asyncpg://medivault:medivault@localhost:5432/medivault
SECRET_KEY=<generate with: python -c "import secrets; print(secrets.token_hex(32))">
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
ALLOWED_ORIGINS=["http://localhost:5173"]
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_KEY=<your-service-key>
STORAGE_BUCKET=medivault
```

### 2.3 Frontend Environment

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:

```dotenv
VITE_API_BASE_URL=http://localhost:8000
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

### 2.4 Start with Docker Compose

```bash
# From repo root
docker-compose up -d

# Watch logs
docker-compose logs -f api
```

Services:
- Frontend (Vite dev server): http://localhost:5173
- Backend API: http://localhost:8000
- API Docs (Swagger): http://localhost:8000/api/docs
- PostgreSQL: localhost:5432

### 2.5 Run Without Docker

**Backend:**

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

---

## 3. Database Migrations

MediVault uses [Alembic](https://alembic.sqlalchemy.org/) for schema migrations.

### Run All Pending Migrations

```bash
cd backend
alembic upgrade head
```

### Create a New Migration

```bash
# After editing a SQLAlchemy model:
alembic revision --autogenerate -m "add_column_foo_to_bar"
alembic upgrade head
```

### Rollback One Migration

```bash
alembic downgrade -1
```

### View Migration History

```bash
alembic history --verbose
```

---

## 4. Seed Demo Data

After running migrations, populate the database with realistic demo data:

```bash
cd backend
python seed_data.py
```

This creates:
- Demo user: `demo@medivault.health` / `Demo123!`
- 4 active medical problems
- 5 medications
- 3 adverse reactions / allergies
- ~150 vital sign observations (2 years of weekly data)
- 8 quarterly pathology reports with full analyte panels
- 5 immunisation records
- 8 clinical encounter notes

---

## 5. Backend Deployment (Render)

### 5.1 Create a Render Account

Sign up at [render.com](https://render.com).

### 5.2 Create a New Web Service

1. Click **New → Web Service**.
2. Connect your GitHub repository.
3. Configure:

| Setting | Value |
|---------|-------|
| Name | `medivault-api` |
| Root Directory | `backend` |
| Environment | `Docker` |
| Region | Closest to your users |
| Branch | `main` |

### 5.3 Environment Variables on Render

Set these in **Environment → Environment Variables**:

```
DATABASE_URL          postgresql+asyncpg://<user>:<pass>@<host>/<db>
SECRET_KEY            <32+ char random string>
ALGORITHM             HS256
ACCESS_TOKEN_EXPIRE_MINUTES  15
REFRESH_TOKEN_EXPIRE_DAYS    7
ALLOWED_ORIGINS       ["https://your-app.vercel.app"]
SUPABASE_URL          https://<project-ref>.supabase.co
SUPABASE_ANON_KEY     <your-anon-key>
SUPABASE_SERVICE_KEY  <your-service-key>
STORAGE_BUCKET        medivault
```

### 5.4 Supabase Postgres (Render Alternative)

You can also use **Render PostgreSQL** (free tier available):

1. **New → PostgreSQL** on Render.
2. Copy the **Internal Database URL** and set it as `DATABASE_URL`.

### 5.5 Automated Deploys

The `.github/workflows/backend-deploy.yml` workflow triggers a Render deploy on every push to `main` that modifies `backend/**`. Required GitHub Secrets:

```
RENDER_SERVICE_ID   — found in your Render service URL
RENDER_API_KEY      — Render dashboard → Account Settings → API Keys
```

---

## 6. Frontend Deployment (Vercel)

### 6.1 Import Project

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New → Project**.
3. Import the `medivault` repository.
4. Set **Root Directory** to `frontend`.

### 6.2 Build Settings

| Setting | Value |
|---------|-------|
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm ci --legacy-peer-deps` |

### 6.3 Environment Variables on Vercel

```
VITE_API_BASE_URL       https://medivault-api.onrender.com
VITE_SUPABASE_URL       https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY  <your-anon-key>
```

### 6.4 Automated Deploys

The `.github/workflows/frontend-deploy.yml` workflow triggers a Vercel production deploy on every push to `main` that modifies `frontend/**`. Required GitHub Secrets:

```
VERCEL_TOKEN       — Vercel dashboard → Settings → Tokens
VERCEL_ORG_ID      — Found in Vercel project settings
VERCEL_PROJECT_ID  — Found in Vercel project settings
```

---

## 7. Health Checks & Monitoring

### Backend Health Endpoint

```bash
curl https://medivault-api.onrender.com/health
# → {"status": "ok"}
```

### View Render Logs

```bash
# Install Render CLI
npm i -g @render-ql/cli
render logs --service medivault-api --tail
```

---

## 8. Troubleshooting

| Problem | Solution |
|---------|----------|
| `asyncpg` connection refused | Check `DATABASE_URL` format: must use `postgresql+asyncpg://` |
| CORS errors in browser | Verify `ALLOWED_ORIGINS` includes your frontend URL (no trailing slash) |
| JWT decode errors | Ensure `SECRET_KEY` is identical between deployments |
| Supabase storage 403 | Check service role key is set (not anon key) for upload operations |
| Alembic `target database is not up to date` | Run `alembic upgrade head` before starting the server |
