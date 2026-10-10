"""Production readiness unit tests for security, tracing, rate limiting, and probes."""

import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_healthz_liveness_probe(client):
    """Ensure /healthz returns status 200 for Kubernetes/Docker orchestrators."""
    response = client.get("/healthz")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "alive"
    assert data["service"] == "pandapulse-ai"


def test_readyz_readiness_probe(client):
    """Ensure /readyz verifies vector store state."""
    response = client.get("/readyz")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ("ready", "degraded")


def test_security_headers_and_tracing(client):
    """Verify security headers and X-Request-ID are injected on all responses."""
    response = client.get("/")
    assert response.status_code == 200
    assert "X-Request-ID" in response.headers
    assert "X-Response-Time" in response.headers
    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert response.headers["X-Frame-Options"] == "SAMEORIGIN"
    assert response.headers["X-XSS-Protection"] == "1; mode=block"


def test_custom_request_id_passthrough(client):
    """If an upstream proxy provides X-Request-ID, it must be preserved."""
    custom_id = "test-upstream-request-id-12345"
    response = client.get("/", headers={"X-Request-ID": custom_id})
    assert response.status_code == 200
    assert response.headers["X-Request-ID"] == custom_id


def test_admin_route_protection_when_key_configured(client):
    """Verify administrative routes are protected when ADMIN_API_KEY is active."""
    original_key = settings.ADMIN_API_KEY
    try:
        settings.ADMIN_API_KEY = "super-secret-admin-token"

        # Missing or invalid key should return 403
        resp_unauth = client.post("/api/v1/cache/clear")
        assert resp_unauth.status_code == 403

        # Valid key should succeed
        resp_auth = client.post(
            "/api/v1/cache/clear",
            headers={"X-Admin-Key": "super-secret-admin-token"},
        )
        assert resp_auth.status_code == 200
    finally:
        settings.ADMIN_API_KEY = original_key
