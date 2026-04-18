from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.routers import (
    auth, persons, problems, medications, reactions,
    vitals, pathology, immunisations, encounters,
    documents, dashboard, export,
)
from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(
    title="MediVault API",
    version="1.0.0",
    description="Personal Health Records API",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(persons.router, prefix="/api/v1/persons", tags=["Persons"])
app.include_router(problems.router, prefix="/api/v1/problems", tags=["Problems"])
app.include_router(medications.router, prefix="/api/v1/medications", tags=["Medications"])
app.include_router(reactions.router, prefix="/api/v1/reactions", tags=["Reactions"])
app.include_router(vitals.router, prefix="/api/v1/vitals", tags=["Vitals"])
app.include_router(pathology.router, prefix="/api/v1/pathology", tags=["Pathology"])
app.include_router(immunisations.router, prefix="/api/v1/immunisations", tags=["Immunisations"])
app.include_router(encounters.router, prefix="/api/v1/encounters", tags=["Encounters"])
app.include_router(documents.router, prefix="/api/v1/documents", tags=["Documents"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["Dashboard"])
app.include_router(export.router, prefix="/api/v1/export", tags=["Export"])


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "MediVault API"}
