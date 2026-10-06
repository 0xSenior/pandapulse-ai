"""Vercel Serverless Function entry point for PandaPulse AI FastAPI backend."""

import os
import sys

# Ensure backend root directory is at the head of sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.main import app

# Export ASGI app for Vercel
app = app
