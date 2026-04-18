# Security Guidelines

## 1. JWT Configuration

MediVault uses a dual-token JWT strategy:

| Token | Lifetime | Purpose |
|-------|----------|---------|
| Access Token | 15 minutes | Authenticate API requests |
| Refresh Token | 7 days | Obtain new access tokens |

### Configuration

Set these environment variables (never commit to source control):

```dotenv
SECRET_KEY=<minimum 32 random bytes — generate with: python -c "import secrets; print(secrets.token_hex(32))">
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
```

### Token Claims

```json
{
  "sub": "<user_id>",
  "exp": <unix_timestamp>,
  "iat": <unix_timestamp>,
  "type": "access"   // or "refresh"
}
```

### Best Practices

- **Rotate `SECRET_KEY`** periodically and on suspected compromise. All existing tokens are immediately invalidated.
- **Store access tokens in memory** (not `localStorage`) to mitigate XSS.
- **Store refresh tokens in httpOnly cookies** with `Secure` and `SameSite=Strict` flags.
- **Never log tokens** in application or infrastructure logs.

---

## 2. Row-Level Security (RLS)

Every database query is scoped to the authenticated user via SQLAlchemy:

```python
# Every CRUD operation includes this filter
result = await db.execute(
    select(ProblemDiagnosis).where(ProblemDiagnosis.user_id == current_user.id)
)
```

This means even if an attacker obtains a valid JWT, they cannot access another user's data through the API.

### Supabase RLS (Defence-in-Depth)

If you expose Supabase tables directly (e.g., via Supabase JS client or PostgREST), enable RLS on every table as a second layer of protection:

```sql
-- Enable RLS on all clinical tables
ALTER TABLE problem_diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE adverse_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vital_signs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pathology_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE immunisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policy template (repeat for each table)
CREATE POLICY "user_isolation"
  ON problem_diagnoses
  FOR ALL
  USING (user_id = auth.uid()::uuid);
```

---

## 3. File Storage (Signed URLs)

All uploaded documents (PDFs, images) are stored in a **private** Supabase Storage bucket.

- Files are **never publicly accessible**.
- Access requires a **signed URL** that expires after **1 hour**.
- File paths are scoped by user ID: `medivault/{user_id}/{category}/{filename}`.

### Generating Signed URLs

```python
# Backend generates signed URL on demand
url = supabase.storage.from_("medivault").create_signed_url(
    path=f"{user_id}/pathology/{report_id}.pdf",
    expires_in=3600  # 1 hour
)
```

### Storage Policy

```sql
-- Supabase Storage RLS: users can only access their own folder
CREATE POLICY "user_scoped_storage"
  ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'medivault'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## 4. Audit Logging

Every create, update, and delete operation is logged to the `audit_logs` table:

```
audit_logs
├── id            UUID
├── user_id       UUID          — who performed the action
├── action        VARCHAR       — CREATE / UPDATE / DELETE / VIEW
├── resource_type VARCHAR       — e.g., "problem_diagnosis"
├── resource_id   UUID          — which record was affected
├── ip_address    VARCHAR       — client IP address
├── user_agent    VARCHAR       — browser/client info
└── timestamp     TIMESTAMP     — UTC timestamp (immutable)
```

Audit logs are **append-only** — application code never updates or deletes them. For compliance deployments, consider enabling `pg_audit` extension in PostgreSQL.

### Viewing Audit Logs (Admin Query)

```sql
SELECT action, resource_type, resource_id, ip_address, timestamp
FROM audit_logs
WHERE user_id = '<target_user_id>'
ORDER BY timestamp DESC
LIMIT 100;
```

---

## 5. Password Requirements

Passwords are validated on registration and change:

| Requirement | Rule |
|------------|------|
| Minimum length | 8 characters |
| Maximum length | 128 characters |
| Uppercase | At least 1 uppercase letter |
| Lowercase | At least 1 lowercase letter |
| Number | At least 1 digit |
| Special character | At least 1 of: `!@#$%^&*()_+-=[]{}|;':,./<>?` |

Passwords are hashed with **bcrypt** (cost factor 12) before storage. The plaintext password is never stored or logged.

```python
# Hashing
hashed = bcrypt.hash(plain_password, rounds=12)

# Verification (constant-time comparison)
bcrypt.verify(plain_password, hashed)
```

---

## 6. HTTPS Configuration

### Production Requirements

- **All traffic must use HTTPS** (TLS 1.2+). HTTP requests should be redirected to HTTPS.
- Vercel and Render both provision TLS certificates automatically via Let's Encrypt.

### HSTS Header

Configure HTTP Strict Transport Security in production:

```python
# FastAPI middleware (add to app/main.py)
from starlette.middleware.httpsredirect import HTTPSRedirectMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware

app.add_middleware(HTTPSRedirectMiddleware)
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["medivault-api.onrender.com", "*.medivault.health"]
)
```

### CORS Configuration

Only the frontend origin is permitted:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,  # ["https://your-app.vercel.app"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Never set `allow_origins=["*"]` in production.**

---

## 7. GDPR / Privacy Considerations

MediVault stores sensitive personal health information. If operating in jurisdictions covered by GDPR, HIPAA, or the Australian Privacy Act, consider the following:

### Data Minimisation

- Collect only health data the user explicitly enters.
- Do not track user behaviour beyond what is necessary for audit logging.

### Right to Erasure (GDPR Article 17)

Implement a full account deletion endpoint:

```
DELETE /auth/account
```

This must:
1. Delete all clinical records for the user.
2. Delete all files in `medivault/{user_id}/` from Supabase Storage.
3. Delete the user record.
4. Retain audit logs (may be required for legal/compliance reasons — document your policy).

### Data Portability (GDPR Article 20)

The `GET /api/export?format=json` endpoint provides a complete structured export of all health records.

### Data at Rest

Supabase PostgreSQL encrypts data at rest using AES-256. Supabase Storage objects are also encrypted at rest.

### Data in Transit

All data is transmitted over TLS 1.2+. The `asyncpg` database driver uses SSL by default when connecting to Supabase.

### Breach Notification

Maintain a documented incident response procedure. GDPR requires notification within 72 hours of discovering a breach.

### Privacy Policy

Display a clear privacy policy to users explaining:
- What data is collected and why
- How long it is retained
- Who can access it
- How to request deletion or export

---

## 8. Dependency Security

### Backend

Run security audits regularly:

```bash
cd backend
pip install pip-audit
pip-audit -r requirements.txt
```

### Frontend

```bash
cd frontend
npm audit
npm audit fix
```

GitHub's Dependabot is recommended for automated vulnerability alerts.

---

## 9. Secrets Management

| Secret | Where to Store |
|--------|---------------|
| `SECRET_KEY` | Render Environment Variables |
| `SUPABASE_SERVICE_KEY` | Render Environment Variables (never expose to frontend) |
| `DATABASE_URL` | Render Environment Variables |
| `VERCEL_TOKEN` | GitHub Actions Secrets |
| `RENDER_API_KEY` | GitHub Actions Secrets |

**Never commit secrets to the repository.** The `.gitignore` excludes `.env` files, but use `git-secrets` or a pre-commit hook as an additional safeguard:

```bash
git secrets --install
git secrets --register-aws  # Prevent AWS keys
```
