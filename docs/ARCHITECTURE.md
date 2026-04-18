# Architecture Overview

## System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Client                              │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │   React 18 SPA (Vite + TypeScript + TailwindCSS)     │  │
│  │   Hosted on Vercel (CDN edge network)                │  │
│  └──────────────────────┬───────────────────────────────┘  │
│                         │ HTTPS                             │
└─────────────────────────│───────────────────────────────────┘
                          │
          ┌───────────────▼────────────────┐
          │    FastAPI Backend             │
          │    Python 3.11 + Uvicorn       │
          │    Hosted on Render            │
          │                               │
          │  ┌─────────────────────────┐  │
          │  │  JWT Auth Middleware    │  │
          │  └────────────┬────────────┘  │
          │               │               │
          │  ┌────────────▼────────────┐  │
          │  │  API Routers (FastAPI)  │  │
          │  │  /auth  /api/*          │  │
          │  └────────────┬────────────┘  │
          │               │               │
          │  ┌────────────▼────────────┐  │
          │  │  SQLAlchemy ORM         │  │
          │  │  (Async / asyncpg)      │  │
          │  └────────────┬────────────┘  │
          └───────────────│───────────────┘
                          │
            ┌─────────────┴──────────────┐
            │                            │
  ┌─────────▼──────────┐    ┌────────────▼────────────┐
  │  Supabase           │    │  Supabase Storage       │
  │  PostgreSQL 15      │    │  (Private S3-compatible) │
  │  Row-Level Security │    │  Signed URLs            │
  └────────────────────┘    └─────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Frontend Framework** | React 18 + TypeScript | Strict mode enabled |
| **Build Tool** | Vite 5 | Fast HMR, ESM output |
| **Styling** | TailwindCSS 3 + shadcn/ui | Component library built on Radix UI |
| **State Management** | React Query (TanStack) | Server state caching and mutations |
| **Routing** | React Router v6 | Client-side routing |
| **Charts** | Recharts | Vital signs and pathology trend charts |
| **Backend Framework** | FastAPI | Async-first, OpenAPI auto-docs |
| **Runtime** | Python 3.11 | `asyncio` throughout |
| **ASGI Server** | Uvicorn | With Gunicorn workers in production |
| **ORM** | SQLAlchemy 2 (async) | Declarative models, async sessions |
| **DB Driver** | asyncpg | High-performance async PostgreSQL driver |
| **Migrations** | Alembic | Auto-generated from SQLAlchemy models |
| **Validation** | Pydantic v2 | Request/response schemas |
| **Authentication** | JWT (python-jose) | Access + refresh token pair |
| **Password Hashing** | bcrypt (passlib) | Cost factor 12 |
| **Database** | PostgreSQL 15 (Supabase) | Managed, with RLS |
| **File Storage** | Supabase Storage | Private bucket, signed URLs |
| **CI/CD** | GitHub Actions | Tests + deploy workflows |
| **Frontend Hosting** | Vercel | Auto-deploy from `main` |
| **Backend Hosting** | Render | Docker-based deployment |

---

## Database Schema Overview

All tables include `id UUID PRIMARY KEY`, `user_id UUID NOT NULL`, `composition_uid UUID`, `created_at TIMESTAMP`, and `updated_at TIMESTAMP`. The `user_id` foreign key enforces data isolation — every query is filtered by the authenticated user's ID.

### Tables

```
users
├── id            UUID PK
├── email         VARCHAR UNIQUE
├── hashed_password VARCHAR
└── is_active     BOOLEAN

persons                        # Patient demographic profile
├── user_id       FK → users
├── family_name   VARCHAR
├── given_names   VARCHAR
├── dob           DATE
├── sex           VARCHAR
├── blood_type    VARCHAR
├── city/state/country VARCHAR
├── phone         VARCHAR
└── emergency_contact_* VARCHAR

problem_diagnoses              # ICD-10 / SNOMED aligned
├── user_id       FK → users
├── problem_name  VARCHAR
├── icd10         VARCHAR
├── snomed_ct     VARCHAR
├── severity      VARCHAR      # mild / moderate / severe
├── status        VARCHAR      # active / resolved / inactive
├── onset_date    DATE
├── resolution_date DATE
└── clinical_notes TEXT

medication_orders              # Active and historical medications
├── user_id       FK → users
├── medication_name VARCHAR
├── generic_name  VARCHAR
├── route         VARCHAR      # oral / IV / topical / etc.
├── dose          VARCHAR
├── frequency     VARCHAR
├── start_date    DATE
├── end_date      DATE
├── status        VARCHAR      # active / completed / ceased
├── prescriber    VARCHAR
└── indication    VARCHAR

adverse_reactions              # Allergies and intolerances
├── user_id       FK → users
├── substance     VARCHAR
├── substance_type VARCHAR     # medication / food / environmental
├── reaction_type  VARCHAR     # allergy / intolerance
├── manifestation TEXT
├── severity      VARCHAR
├── criticality   VARCHAR      # low / high / unable-to-assess
├── verification_status VARCHAR # confirmed / unconfirmed / refuted
└── onset_date    DATE

vital_signs                    # Observation measurements
├── user_id       FK → users
├── observation_type VARCHAR   # blood_pressure / weight / etc.
├── value_numeric  FLOAT
├── value_numeric_2 FLOAT      # second value, e.g. diastolic BP
├── value_unit    VARCHAR
├── observation_datetime TIMESTAMP
└── notes         TEXT

pathology_reports              # Lab results with JSONB analyte array
├── user_id       FK → users
├── report_name   VARCHAR
├── lab_name      VARCHAR
├── panel_type    VARCHAR      # metabolic / haematology / etc.
├── report_date   DATE
├── ordering_provider VARCHAR
├── results       JSONB        # Array of analyte objects
└── document_url  TEXT         # Supabase Storage URL

immunisations
├── user_id       FK → users
├── vaccine_name  VARCHAR
├── disease_targeted VARCHAR
├── administration_date DATE
├── batch_number  VARCHAR
├── dose_number   INTEGER
├── next_due_date DATE
├── site          VARCHAR
└── administered_by VARCHAR

clinical_encounters
├── user_id       FK → users
├── encounter_type VARCHAR     # outpatient / inpatient / telehealth / ED
├── encounter_date DATE
├── provider_name VARCHAR
├── provider_specialty VARCHAR
├── facility      VARCHAR
├── chief_complaint TEXT
├── assessment    TEXT
└── plan          TEXT

documents                      # Generic document storage
├── user_id       FK → users
├── title         VARCHAR
├── document_type VARCHAR
├── document_date DATE
├── file_url      TEXT         # Supabase Storage URL
└── file_size_bytes INTEGER

audit_logs                     # Immutable audit trail
├── user_id       FK → users
├── action        VARCHAR      # CREATE / UPDATE / DELETE / VIEW
├── resource_type VARCHAR
├── resource_id   UUID
├── ip_address    VARCHAR
└── timestamp     TIMESTAMP
```

### OpenEHR Alignment

The schema is inspired by OpenEHR archetypes:

| MediVault Table | OpenEHR Archetype |
|----------------|-------------------|
| `problem_diagnoses` | `openEHR-EHR-EVALUATION.problem_diagnosis.v1` |
| `medication_orders` | `openEHR-EHR-INSTRUCTION.medication_order.v3` |
| `adverse_reactions` | `openEHR-EHR-EVALUATION.adverse_reaction_risk.v2` |
| `vital_signs` | `openEHR-EHR-OBSERVATION.blood_pressure.v2` etc. |
| `clinical_encounters` | `openEHR-EHR-COMPOSITION.encounter.v1` |

---

## Authentication Flow

```
1. User submits email + password
         │
         ▼
2. FastAPI /auth/login validates credentials against hashed_password (bcrypt)
         │
         ▼
3. Server issues:
   • access_token  (JWT, expires in 15 min)
   • refresh_token (JWT, expires in 7 days)
         │
         ▼
4. Frontend stores tokens in memory (access) and httpOnly cookie / localStorage (refresh)
         │
         ▼
5. Each API request includes:
   Authorization: Bearer <access_token>
         │
         ▼
6. JWTMiddleware decodes token → extracts user_id → injects into request state
         │
         ▼
7. All DB queries filter by user_id (no cross-user data leakage)
         │
         ▼
8. When access_token expires (401):
   • Frontend calls POST /auth/refresh with refresh_token
   • Server validates refresh_token, issues new access_token
   • Original request is retried transparently
```

---

## PDF Upload Flow

```
1. User selects PDF file in browser
         │
         ▼
2. Frontend POSTs multipart/form-data to:
   POST /api/pathology/{id}/upload-pdf
         │
         ▼
3. FastAPI receives file bytes, validates:
   • MIME type = application/pdf
   • File size ≤ 10 MB
         │
         ▼
4. File uploaded to Supabase Storage:
   Path: medivault/{user_id}/pathology/{report_id}.pdf
         │
         ▼
5. Backend calls PDF extraction service (pdfplumber):
   • Parses text layer for analyte patterns
   • Returns structured result array
         │
         ▼
6. PathologyReport.results updated in database
   PathologyReport.document_url set to Supabase path
         │
         ▼
7. Frontend requests signed URL:
   GET /api/documents/{id}/url
         │
         ▼
8. Supabase generates time-limited signed URL (1 hour)
   Frontend renders PDF in-browser viewer
```
