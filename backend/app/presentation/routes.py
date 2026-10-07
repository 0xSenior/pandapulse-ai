"""API Presentation routes for PandaPulse AI."""

import json

from fastapi import APIRouter, Depends, Query as QueryParam
from fastapi.responses import StreamingResponse

from app.application.dto import IngestRequestDTO, QueryRequestDTO
from app.application.use_cases import (
    GetStatusUseCase,
    IngestDocsUseCase,
    QueryPandasDocsUseCase,
)
from app.domain.interfaces import ICache, IVectorStore
from app.presentation.dependencies import (
    get_cache,
    get_ingest_use_case,
    get_query_use_case,
    get_status_use_case,
    get_vector_store,
)
from app.presentation.schemas import (
    ChatRequest,
    ChatResponse,
    ChunkInspectionSchema,
    CitationSchema,
    ReindexRequest,
    ReindexResponse,
    StatusResponse,
)

router = APIRouter(prefix="/api/v1", tags=["PandaPulse AI"])


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(
    request: ChatRequest,
    use_case: QueryPandasDocsUseCase = Depends(get_query_use_case),
):
    """Synchronous RAG query endpoint with Cache-First resolution."""
    dto_in = QueryRequestDTO(
        query=request.query,
        top_k=request.top_k,
        session_id=request.session_id,
        history=request.history,
    )
    result = await use_case.execute(dto_in)

    return ChatResponse(
        answer=result.answer,
        citations=[CitationSchema(**c) for c in result.citations],
        latency_ms=result.latency_ms,
        cached=result.cached,
        tokens_generated=result.tokens_generated,
        model_name=result.model_name,
        timestamp=result.timestamp,
    )


@router.post("/stream-chat")
async def stream_chat_endpoint(
    request: ChatRequest,
    use_case: QueryPandasDocsUseCase = Depends(get_query_use_case),
):
    """Server-Sent Events (SSE) streaming endpoint for live token generation."""
    dto_in = QueryRequestDTO(
        query=request.query,
        top_k=request.top_k,
        session_id=request.session_id,
        history=request.history,
    )

    async def event_generator():
        try:
            async for event in use_case.execute_stream(dto_in):
                event_type = event.get("event", "message")
                data_payload = json.dumps(event.get("data", {}))
                yield f"event: {event_type}\ndata: {data_payload}\n\n"
        except Exception as e:
            err_data = json.dumps({"error": str(e)})
            yield f"event: error\ndata: {err_data}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/status", response_model=StatusResponse)
async def status_endpoint(
    use_case: GetStatusUseCase = Depends(get_status_use_case),
):
    """System diagnostic, vector metrics, and LRU cache statistics."""
    res = await use_case.execute()
    return StatusResponse(
        service=res.service,
        version=res.version,
        status=res.status,
        total_indexed_chunks=res.total_indexed_chunks,
        cache_stats=res.cache_stats,
        ollama_status=res.ollama_status,
        active_model=res.active_model,
        embedding_model=res.embedding_model,
        timestamp=res.timestamp,
    )


@router.post("/reindex", response_model=ReindexResponse)
async def reindex_endpoint(
    request: ReindexRequest = ReindexRequest(),
    use_case: IngestDocsUseCase = Depends(get_ingest_use_case),
):
    """Rebuild or incrementally update ChromaDB vector store."""
    dto_in = IngestRequestDTO(
        directory_path=request.directory_path,
        force_reindex=request.force_reindex,
    )
    result = await use_case.execute(dto_in)
    return ReindexResponse(
        status=result.status,
        indexed_files=result.indexed_files,
        skipped_files=result.skipped_files,
        total_chunks=result.total_chunks,
        duration_ms=result.duration_ms,
        manifest_summary=result.manifest_summary,
    )


@router.get("/chunks", response_model=list[ChunkInspectionSchema])
async def get_chunks_endpoint(
    limit: int = QueryParam(default=30, ge=1, le=100),
    vector_store: IVectorStore = Depends(get_vector_store),
):
    """Inspect indexed document chunks in the Knowledge Base UI."""
    chunks = vector_store.get_all_chunks(limit=limit)
    return [
        ChunkInspectionSchema(
            id=c.id,
            content=c.content,
            source_file=c.source_file,
            chunk_index=c.chunk_index,
            char_count=c.char_count,
            metadata=c.metadata,
        )
        for c in chunks
    ]


@router.post("/cache/clear")
async def clear_cache_endpoint(
    cache: ICache = Depends(get_cache),
):
    """Manually flush the query cache."""
    cache.clear()
    return {"message": "Cache successfully cleared", "stats": cache.get_stats()}
