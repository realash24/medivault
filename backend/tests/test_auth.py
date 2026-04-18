import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from unittest.mock import AsyncMock, patch, MagicMock
from app.main import app
from app.core.security import get_password_hash, verify_password, create_access_token, verify_token


# ── Unit tests for security helpers ──────────────────────────────────────────

def test_password_hash_and_verify():
    hashed = get_password_hash("testpassword123")
    assert hashed != "testpassword123"
    assert verify_password("testpassword123", hashed)
    assert not verify_password("wrongpassword", hashed)


def test_create_and_verify_access_token():
    token = create_access_token({"sub": "user-uuid-123"})
    payload = verify_token(token)
    assert payload["sub"] == "user-uuid-123"
    assert payload["type"] == "access"


def test_verify_invalid_token():
    payload = verify_token("this.is.not.a.valid.token")
    assert payload == {}


# ── Integration tests using mocked DB ────────────────────────────────────────

@pytest.fixture
def mock_db():
    """Return a mock AsyncSession."""
    db = AsyncMock()
    db.execute = AsyncMock()
    db.flush = AsyncMock()
    db.commit = AsyncMock()
    db.refresh = AsyncMock()
    db.add = MagicMock()
    db.rollback = AsyncMock()
    db.close = AsyncMock()
    return db


@pytest.fixture
def mock_get_db(mock_db):
    async def _override():
        yield mock_db
    return _override


@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


@pytest.mark.asyncio
async def test_register_duplicate_email(mock_db, mock_get_db):
    """Registering with an already-used email should return 400."""
    from app.core.database import get_db
    from sqlalchemy.engine import Result

    # Simulate existing user found
    mock_result = MagicMock(spec=Result)
    mock_result.scalar_one_or_none.return_value = MagicMock()  # existing user
    mock_db.execute.return_value = mock_result

    app.dependency_overrides[get_db] = mock_get_db

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/auth/register", json={
            "email": "test@example.com",
            "password": "password123",
            "family_name": "Smith",
            "given_names": "John",
        })

    app.dependency_overrides.clear()
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]


@pytest.mark.asyncio
async def test_login_invalid_credentials(mock_db, mock_get_db):
    """Login with wrong password should return 401."""
    from app.core.database import get_db
    from sqlalchemy.engine import Result

    # User exists but wrong password check
    fake_user = MagicMock()
    fake_user.hashed_password = get_password_hash("correctpassword")
    fake_user.is_active = True

    mock_result = MagicMock(spec=Result)
    mock_result.scalar_one_or_none.return_value = fake_user
    mock_db.execute.return_value = mock_result

    app.dependency_overrides[get_db] = mock_get_db

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/auth/login", json={
            "email": "test@example.com",
            "password": "wrongpassword",
        })

    app.dependency_overrides.clear()
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_protected_endpoint_requires_auth():
    """Accessing a protected endpoint without a token should return 403."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/problems/")
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_logout():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/auth/logout")
    assert response.status_code == 200
    assert "Logged out" in response.json()["message"]
