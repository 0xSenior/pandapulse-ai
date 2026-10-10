"""Production-grade middleware for PandaPulse AI.

Provides:
1. Security Headers enforcement
2. Distributed Request Tracing (X-Request-ID & X-Response-Time)
3. Sliding Window Rate Limiting for AI endpoints
"""

import time
import uuid
from collections import defaultdict
from collections.abc import Callable

from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import settings


class SecurityAndTracingMiddleware(BaseHTTPMiddleware):
    """Enforces standard HTTP security headers and attaches correlation tracking."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Correlation ID from upstream proxy or generated fresh
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        start_time = time.perf_counter()

        response = await call_next(request)

        latency_ms = round((time.perf_counter() - start_time) * 1000, 2)

        # Tracing headers
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Response-Time"] = f"{latency_ms}ms"

        # Production security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """In-memory sliding window rate limiter to safeguard AI inference quotas."""

    def __init__(self, app, per_minute: int = 60, enabled: bool = True):
        super().__init__(app)
        self.per_minute = per_minute
        self.enabled = enabled
        self._requests: dict[str, list[float]] = defaultdict(list)

    def _get_client_ip(self, request: Request) -> str:
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip.strip()
        return request.client.host if request.client else "127.0.0.1"

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        if not self.enabled:
            return await call_next(request)

        # Only apply strict rate limits to LLM generation endpoints
        path = request.url.path
        if path.startswith("/api/v1/chat") or path.startswith("/api/v1/stream-chat"):
            client_ip = self._get_client_ip(request)
            now = time.time()
            window_start = now - 60.0

            # Prune timestamps older than 60 seconds
            client_history = [t for t in self._requests[client_ip] if t > window_start]
            self._requests[client_ip] = client_history

            limit = getattr(settings, "RATE_LIMIT_PER_MINUTE", self.per_minute)

            if len(client_history) >= limit:
                retry_after = int(60 - (now - client_history[0])) if client_history else 60
                return JSONResponse(
                    status_code=429,
                    content={
                        "error": "Rate limit exceeded",
                        "message": f"Too many AI requests. Please slow down. Allowed: {limit} requests/minute.",
                        "retry_after": max(1, retry_after),
                    },
                    headers={
                        "Retry-After": str(max(1, retry_after)),
                        "X-RateLimit-Limit": str(limit),
                        "X-RateLimit-Remaining": "0",
                    },
                )

            # Record this request
            self._requests[client_ip].append(now)

            response = await call_next(request)
            remaining = max(0, limit - len(self._requests[client_ip]))
            response.headers["X-RateLimit-Limit"] = str(limit)
            response.headers["X-RateLimit-Remaining"] = str(remaining)
            return response

        return await call_next(request)
