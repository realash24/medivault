# API Documentation

Base URL: `https://medivault-api.onrender.com` (production) or `http://localhost:8000` (local)

Interactive docs: `GET /api/docs` (Swagger UI) | `GET /api/redoc` (ReDoc)

All endpoints (except `/auth/register` and `/auth/login`) require:

```
Authorization: Bearer <access_token>
```

---

## Authentication

### Register

```http
POST /auth/register
Content-Type: application/json
```

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response `201`:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "is_active": true
}
```

**Errors:**
- `400` — Email already registered
- `422` — Validation error (password too weak)

---

### Login

```http
POST /auth/login
Content-Type: application/x-www-form-urlencoded
```

**Request body (form data):**
```
username=user@example.com&password=SecurePass123!
```

**Response `200`:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer"
}
```

**Errors:**
- `401` — Incorrect email or password

---

### Refresh Token

```http
POST /auth/refresh
Content-Type: application/json
```

**Request:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**Response `200`:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer"
}
```

---

### Get Current User

```http
GET /auth/me
Authorization: Bearer <access_token>
```

**Response `200`:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "is_active": true
}
```

---

## Person (Patient Profile)

### Get Profile

```http
GET /api/person
Authorization: Bearer <access_token>
```

**Response `200`:**
```json
{
  "id": "uuid",
  "family_name": "Smith",
  "given_names": "John",
  "dob": "1985-06-15",
  "sex": "male",
  "blood_type": "O+",
  "city": "Sydney",
  "state": "NSW",
  "country": "Australia",
  "phone": "+61400000000",
  "emergency_contact_name": "Jane Smith",
  "emergency_contact_phone": "+61400000001"
}
```

### Create / Update Profile

```http
PUT /api/person
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request:**
```json
{
  "family_name": "Smith",
  "given_names": "John",
  "dob": "1985-06-15",
  "sex": "male",
  "blood_type": "O+",
  "city": "Sydney",
  "state": "NSW",
  "country": "Australia",
  "phone": "+61400000000",
  "emergency_contact_name": "Jane Smith",
  "emergency_contact_phone": "+61400000001"
}
```

**Response `200`:** Updated profile object.

---

## Problems / Diagnoses

### List Problems

```http
GET /api/problems
Authorization: Bearer <access_token>
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `status` | string | Filter: `active`, `resolved`, `inactive` |
| `skip` | int | Pagination offset (default: 0) |
| `limit` | int | Page size (default: 100, max: 200) |

**Response `200`:**
```json
[
  {
    "id": "uuid",
    "problem_name": "Type 2 Diabetes Mellitus",
    "icd10": "E11",
    "snomed_ct": "44054006",
    "severity": "moderate",
    "status": "active",
    "onset_date": "2023-01-15",
    "resolution_date": null,
    "clinical_notes": "HbA1c controlled on metformin.",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### Create Problem

```http
POST /api/problems
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request:**
```json
{
  "problem_name": "Essential Hypertension",
  "icd10": "I10",
  "snomed_ct": "59621000",
  "severity": "mild",
  "status": "active",
  "onset_date": "2023-03-01",
  "clinical_notes": "BP target <130/80."
}
```

**Response `201`:** Created problem object.

### Get Problem

```http
GET /api/problems/{id}
```

### Update Problem

```http
PUT /api/problems/{id}
Content-Type: application/json
```

### Delete Problem

```http
DELETE /api/problems/{id}
```

**Response `204`:** No content.

---

## Medications

### List Medications

```http
GET /api/medications
```

**Query Parameters:** `status` (active/completed/ceased), `skip`, `limit`

**Response `200`:**
```json
[
  {
    "id": "uuid",
    "medication_name": "Metformin",
    "generic_name": "Metformin hydrochloride",
    "route": "oral",
    "dose": "1000mg",
    "frequency": "twice daily",
    "start_date": "2023-01-20",
    "end_date": null,
    "status": "active",
    "prescriber": "Dr. Smith",
    "indication": "Type 2 Diabetes Mellitus"
  }
]
```

### Create Medication

```http
POST /api/medications
Content-Type: application/json
```

**Request:**
```json
{
  "medication_name": "Metformin",
  "generic_name": "Metformin hydrochloride",
  "route": "oral",
  "dose": "1000mg",
  "frequency": "twice daily",
  "start_date": "2023-01-20",
  "status": "active",
  "prescriber": "Dr. Smith",
  "indication": "Type 2 Diabetes Mellitus"
}
```

**Response `201`:** Created medication object.

### Get / Update / Delete

```http
GET    /api/medications/{id}
PUT    /api/medications/{id}
DELETE /api/medications/{id}
```

---

## Adverse Reactions (Allergies)

### List Reactions

```http
GET /api/reactions
```

**Response `200`:**
```json
[
  {
    "id": "uuid",
    "substance": "Penicillin",
    "substance_type": "medication",
    "reaction_type": "allergy",
    "manifestation": "Urticaria, angioedema",
    "severity": "moderate",
    "criticality": "high",
    "verification_status": "confirmed",
    "onset_date": "2005-03-10"
  }
]
```

### Create Reaction

```http
POST /api/reactions
Content-Type: application/json
```

**Request:**
```json
{
  "substance": "Penicillin",
  "substance_type": "medication",
  "reaction_type": "allergy",
  "manifestation": "Urticaria, angioedema",
  "severity": "moderate",
  "criticality": "high",
  "verification_status": "confirmed",
  "onset_date": "2005-03-10"
}
```

### Get / Update / Delete

```http
GET    /api/reactions/{id}
PUT    /api/reactions/{id}
DELETE /api/reactions/{id}
```

---

## Vital Signs

### List Vital Signs

```http
GET /api/vitals
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `observation_type` | string | Filter: `blood_pressure`, `weight`, `height`, `blood_glucose`, `heart_rate`, `temperature`, `oxygen_saturation` |
| `from_date` | date | ISO 8601 date (e.g. `2024-01-01`) |
| `to_date` | date | ISO 8601 date |
| `skip` | int | Pagination offset |
| `limit` | int | Page size |

**Response `200`:**
```json
[
  {
    "id": "uuid",
    "observation_type": "blood_pressure",
    "value_numeric": 128.5,
    "value_numeric_2": 82.0,
    "value_unit": "mmHg",
    "observation_datetime": "2024-06-01T09:00:00Z",
    "notes": null
  }
]
```

### Create Vital Sign

```http
POST /api/vitals
Content-Type: application/json
```

**Request:**
```json
{
  "observation_type": "blood_pressure",
  "value_numeric": 128.5,
  "value_numeric_2": 82.0,
  "value_unit": "mmHg",
  "observation_datetime": "2024-06-01T09:00:00Z"
}
```

### Get / Update / Delete

```http
GET    /api/vitals/{id}
PUT    /api/vitals/{id}
DELETE /api/vitals/{id}
```

---

## Pathology Reports

### List Reports

```http
GET /api/pathology
```

**Query Parameters:** `panel_type`, `from_date`, `to_date`, `skip`, `limit`

**Response `200`:**
```json
[
  {
    "id": "uuid",
    "report_name": "Metabolic Panel Jun 2024",
    "lab_name": "PathWest Laboratories",
    "panel_type": "metabolic",
    "report_date": "2024-06-01",
    "ordering_provider": "Dr. Smith",
    "results": [
      {
        "analyte": "HbA1c",
        "value": 7.2,
        "unit": "%",
        "ref_range_low": 4.0,
        "ref_range_high": 6.0,
        "flag": "H"
      }
    ],
    "document_url": null
  }
]
```

### Create Report

```http
POST /api/pathology
Content-Type: application/json
```

### Upload PDF

```http
POST /api/pathology/{id}/upload-pdf
Content-Type: multipart/form-data
```

**Form field:** `file` — PDF file (max 10 MB)

**Response `200`:**
```json
{
  "document_url": "https://<project>.supabase.co/storage/v1/object/sign/medivault/...",
  "extracted_results": [
    {"analyte": "HbA1c", "value": 7.2, "unit": "%"}
  ]
}
```

### Get / Update / Delete

```http
GET    /api/pathology/{id}
PUT    /api/pathology/{id}
DELETE /api/pathology/{id}
```

---

## Immunisations

### List Immunisations

```http
GET /api/immunisations
```

**Response `200`:**
```json
[
  {
    "id": "uuid",
    "vaccine_name": "COVID-19 mRNA Vaccine (Moderna)",
    "disease_targeted": "COVID-19",
    "administration_date": "2021-05-15",
    "batch_number": "MOD-2021-001",
    "dose_number": 1,
    "next_due_date": null,
    "site": null,
    "administered_by": null
  }
]
```

### Create / Get / Update / Delete

```http
POST   /api/immunisations
GET    /api/immunisations/{id}
PUT    /api/immunisations/{id}
DELETE /api/immunisations/{id}
```

---

## Clinical Encounters

### List Encounters

```http
GET /api/encounters
```

**Query Parameters:** `encounter_type`, `from_date`, `to_date`, `skip`, `limit`

**Response `200`:**
```json
[
  {
    "id": "uuid",
    "encounter_type": "outpatient",
    "encounter_date": "2024-06-01",
    "provider_name": "Dr. Sarah Smith",
    "provider_specialty": "General Practice",
    "facility": "City Medical Centre",
    "chief_complaint": "Diabetes review",
    "assessment": "HbA1c slightly elevated.",
    "plan": "Continue medications. Repeat in 3 months."
  }
]
```

### Create / Get / Update / Delete

```http
POST   /api/encounters
GET    /api/encounters/{id}
PUT    /api/encounters/{id}
DELETE /api/encounters/{id}
```

---

## Documents

### List Documents

```http
GET /api/documents
```

### Upload Document

```http
POST /api/documents/upload
Content-Type: multipart/form-data
```

**Form fields:**
- `file` — File to upload (PDF, image; max 10 MB)
- `document_type` — e.g. `referral`, `letter`, `imaging`, `other`
- `title` — Display name
- `document_date` — ISO 8601 date

**Response `201`:**
```json
{
  "id": "uuid",
  "title": "Cardiology Referral",
  "document_type": "referral",
  "document_date": "2024-06-01",
  "file_url": "https://...",
  "file_size_bytes": 204800
}
```

### Get Signed URL

```http
GET /api/documents/{id}/url
```

Returns a time-limited (1 hour) signed URL for the document.

**Response `200`:**
```json
{
  "url": "https://<project>.supabase.co/storage/v1/object/sign/medivault/...",
  "expires_at": "2024-06-01T10:00:00Z"
}
```

### Delete Document

```http
DELETE /api/documents/{id}
```

---

## Dashboard

### Get Dashboard Summary

```http
GET /api/dashboard
```

**Response `200`:**
```json
{
  "active_problems_count": 4,
  "active_medications_count": 4,
  "high_criticality_allergies_count": 1,
  "overdue_immunisations": [
    {
      "vaccine_name": "Influenza Vaccine",
      "next_due_date": "2024-01-01"
    }
  ],
  "recent_vitals": {
    "blood_pressure": {"systolic": 128, "diastolic": 82, "date": "2024-06-01"},
    "weight": {"value": 85.2, "unit": "kg", "date": "2024-05-20"}
  },
  "latest_pathology_flags": [
    {"analyte": "HbA1c", "value": 7.2, "flag": "H", "report_date": "2024-06-01"}
  ]
}
```

---

## Export

### Export Health Record

```http
GET /api/export
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `format` | string | `json` | `json` or `pdf` |

**Response for `format=json`:** Full health record as a single JSON object.

**Response for `format=pdf`:** Binary PDF download.

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="medivault_export_2024-06-01.pdf"
```

---

## Error Codes

| HTTP Status | Code | Description |
|-------------|------|-------------|
| `400` | `BAD_REQUEST` | Malformed request body |
| `401` | `UNAUTHORIZED` | Missing or invalid token |
| `403` | `FORBIDDEN` | Access denied to another user's resource |
| `404` | `NOT_FOUND` | Resource does not exist |
| `409` | `CONFLICT` | Duplicate resource (e.g., email already registered) |
| `422` | `UNPROCESSABLE_ENTITY` | Pydantic validation failure |
| `500` | `INTERNAL_SERVER_ERROR` | Unexpected server error |

**Error Response Format:**
```json
{
  "detail": "Human-readable error message"
}
```
