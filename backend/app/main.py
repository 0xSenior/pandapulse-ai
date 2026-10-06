"""Main FastAPI application factory for PandaPulse AI."""

from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.presentation.routes import router as api_router
from app.presentation.dependencies import (
    get_doc_loader,
    get_vector_store,
    get_cache,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("pandapulse")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle: auto-indexes documentation on initial cold boot if empty."""
    logger.info("Initializing PandaPulse AI Engine...")
    vector_store = get_vector_store()
    doc_loader = get_doc_loader()

    # Check if vector collection already has data
    current_count = vector_store.count()
    if current_count == 0:
        logger.info(f"Vector database is empty. Auto-indexing documentation from '{settings.DOCS_DIRECTORY}'...")
        chunks = doc_loader.load_and_chunk(settings.DOCS_DIRECTORY)
        if chunks:
            indexed = await vector_store.add_chunks(chunks)
            logger.info(f"Successfully auto-indexed {indexed} chunks into ChromaDB.")
        else:
            logger.warning(f"No documentation files found in {settings.DOCS_DIRECTORY}.")
    else:
        logger.info(f"ChromaDB ready with {current_count} pre-indexed semantic chunks.")

    yield
    logger.info("Shutting down PandaPulse AI Engine...")


def create_app() -> FastAPI:
    """Build and configure the FastAPI application."""
    app = FastAPI(
        title="PandaPulse AI",
        description="The Neural Copilot for Python Programming and Modern Pandas Data Engineering",
        version="1.0.0",
        lifespan=lifespan,
    )

    # CORS Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Mount API Router
    app.include_router(api_router)

    @app.get("/")
    async def root():
        return {
            "name": "PandaPulse AI",
            "tagline": "The Neural Copilot for Python Programming and Modern Pandas Data Engineering",
            "version": "1.0.0",
            "status": "operational",
            "endpoints": {
                "docs": "/docs",
                "chat": "/api/v1/chat",
                "stream_chat": "/api/v1/stream-chat",
                "status": "/api/v1/status",
                "reindex": "/api/v1/reindex",
                "chunks": "/api/v1/chunks",
            },
        }

    return app


app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
