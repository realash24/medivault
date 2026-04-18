# MediVault 🏥

Personal Health Records Application built with FastAPI + React + Supabase

[![Tests](https://github.com/realash24/medivault/actions/workflows/tests.yml/badge.svg)](https://github.com/realash24/medivault/actions/workflows/tests.yml)

## Features

- 📋 **Complete Health Records** - Problems, medications, allergies, vitals, pathology, immunisations, encounters, documents
- 📊 **Data Visualization** - Vital signs trends, pathology analyte trends, medication timeline
- 🔒 **Secure** - JWT authentication, row-level security, audit logging
- 📱 **PWA** - Mobile-first, installable, offline reading
- 📄 **PDF Handling** - Upload pathology PDFs, auto-extract lab values
- 🧮 **Health Tools** - BMI, eGFR, Framingham Risk, AUDIT-C calculators
- 🔗 **OpenEHR Aligned** - Database schema follows OpenEHR archetypes
- 📤 **Data Export** - JSON and PDF summary export

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui |
| Backend | Python 3.11 + FastAPI + SQLAlchemy + Alembic |
| Database | Supabase PostgreSQL |
| Storage | Supabase Storage |
| Deployment | Vercel (frontend) + Render (backend) |

## Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+
- Docker + Docker Compose
- Supabase account

### Local Development

```bash
# Clone the repository
git clone https://github.com/realash24/medivault.git
cd medivault

# Start with Docker Compose
docker-compose up -d

# OR run separately:

# Backend
cd backend
cp .env.example .env
# Edit .env with your Supabase credentials
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload

# Frontend
cd frontend
cp .env.example .env
npm install
npm run dev
```

Visit:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api/docs

### Demo Account
After running the seed script:
- Email: demo@medivault.health
- Password: Demo123!

## Documentation

- [Deployment Guide](docs/DEPLOYMENT.md)
- [API Documentation](docs/API.md)
- [Architecture Overview](docs/ARCHITECTURE.md)
- [Security Guidelines](docs/SECURITY.md)

## License

MIT
