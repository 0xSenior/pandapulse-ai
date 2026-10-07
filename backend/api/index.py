"""Vercel Serverless Function entry point for PandaPulse AI FastAPI backend."""

import os
import sys

# Ensure backend root directory is at the head of sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.main import app


class VercelPathMiddleware:
    """Restores the client-requested URI from Vercel's rewrite headers so FastAPI routes match cleanly."""

    def __init__(self, asgi_app):
        self.asgi_app = asgi_app

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            headers = dict(scope.get("headers", []))
            raw_path = (
                headers.get(b"x-forwarded-uri")
                or headers.get(b"x-matched-path")
                or headers.get(b"x-real-path")
            )
            if raw_path:
                scope["path"] = raw_path.decode("utf-8").split("?")[0]
        await self.asgi_app(scope, receive, send)


app = VercelPathMiddleware(app)
