import React, { useState, useEffect } from 'react';
import {
  Database,
  RefreshCw,
  Trash2,
  Search,
  FileText,
  CheckCircle2,
  AlertCircle,
  Hash,
  Cpu,
  Layers,
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export const KnowledgePage = () => {
  const [status, setStatus] = useState(null);
  const [chunks, setChunks] = useState([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [reindexing, setReindexing] = useState(false);
  const [notification, setNotification] = useState(null);

  const fetchStatusAndChunks = async () => {
    try {
      setLoading(true);
      const [resStatus, resChunks] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/status`),
        fetch(`${API_BASE_URL}/api/v1/chunks?limit=50`),
      ]);

      if (resStatus.ok) {
        const data = await resStatus.json();
        setStatus(data);
      }
      if (resChunks.ok) {
        const chunkData = await resChunks.json();
        setChunks(chunkData);
      }
    } catch (e) {
      console.error('Failed to fetch status:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatusAndChunks();
  }, []);

  const handleReindex = async () => {
    try {
      setReindexing(true);
      const res = await fetch(`${API_BASE_URL}/api/v1/reindex`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force_reindex: true }),
      });
      if (res.ok) {
        setNotification({
          type: 'success',
          message: 'Vector index successfully rebuilt and synced with active data.',
        });
        await fetchStatusAndChunks();
      } else {
        setNotification({
          type: 'error',
          message: 'Failed to rebuild index. Please check your backend logs.',
        });
      }
    } catch {
      setNotification({
        type: 'error',
        message: 'Network error communicating with indexing service.',
      });
    } finally {
      setReindexing(false);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleClearCache = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/cache/clear`, {
        method: 'POST',
      });
      if (res.ok) {
        setNotification({
          type: 'success',
          message: 'Query cache flushed successfully.',
        });
        await fetchStatusAndChunks();
      }
    } catch {
      setNotification({
        type: 'error',
        message: 'Failed to clear cache.',
      });
    } finally {
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const filteredChunks = chunks.filter(
    (c) =>
      c.content?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.source_file?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="py-10 px-4 sm:px-6 max-w-6xl mx-auto pb-28 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/[0.08]">
        <div>
          <span className="text-[11.5px] font-mono uppercase tracking-[0.2em] text-[#6799fe] mb-1.5 block">
            Knowledge Engine Telemetry
          </span>
          <h1 className="text-3xl sm:text-4xl font-display font-medium text-white tracking-tight flex items-center gap-2.5">
            Knowledge Base & Chunks
          </h1>
          <p className="text-sm text-white/60 mt-1 max-w-2xl leading-relaxed">
            Real-time ChromaDB collection telemetry for Python & Pandas 2.0+ documentation, vector inspection, and neural index management.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            type="button"
            disabled={reindexing}
            onClick={handleReindex}
            className="ds-btn-primary text-xs px-4 py-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${reindexing ? 'animate-spin' : ''}`} />
            <span>{reindexing ? 'Reindexing...' : 'Rebuild Index'}</span>
          </button>

          <button
            type="button"
            onClick={handleClearCache}
            className="ds-btn-secondary text-xs px-4 py-2"
          >
            <Trash2 className="w-3.5 h-3.5 text-white/60" />
            <span>Flush Cache</span>
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl mb-6 text-xs font-mono flex items-center gap-2.5 ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="ds-card p-4">
          <div className="text-[11px] font-mono uppercase tracking-wider text-white/40 mb-1">Total Chunks</div>
          <div className="text-2xl font-display font-medium text-white">
            {status?.total_indexed_chunks ?? chunks.length}
          </div>
          <div className="text-[11px] font-mono text-[#6799fe] mt-1">ChromaDB Persistent</div>
        </div>

        <div className="ds-card p-4">
          <div className="text-[11px] font-mono uppercase tracking-wider text-white/40 mb-1">Cached Queries</div>
          <div className="text-2xl font-display font-medium text-white">
            {status?.cache_stats?.current_size ?? 0} <span className="text-sm text-white/40">/ {status?.cache_stats?.capacity ?? 256}</span>
          </div>
          <div className="text-[11px] font-mono text-emerald-400 mt-1">
            Hit Ratio: {status?.cache_stats?.hit_percentage ?? '0%'}
          </div>
        </div>

        <div className="ds-card p-4">
          <div className="text-[11px] font-mono uppercase tracking-wider text-white/40 mb-1">Embedding Engine</div>
          <div className="text-lg font-display font-medium text-white truncate">
            {status?.embedding_model ?? 'nomic-embed-text'}
          </div>
          <div className="text-[11px] font-mono text-white/50 mt-1">768-dim Vector Space</div>
        </div>

        <div className="ds-card p-4">
          <div className="text-[11px] font-mono uppercase tracking-wider text-white/40 mb-1">Model Backend</div>
          <div className="text-lg font-display font-medium text-white truncate">
            {status?.active_model ?? 'DeepSeek-V4-Flash'}
          </div>
          <div className="text-[11px] font-mono text-emerald-400 mt-1">
            Status: {status?.ollama_status ?? 'online'}
          </div>
        </div>
      </div>

      {/* Search and Chunks List */}
      <div className="ds-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#6799fe]" />
            <span className="font-display font-medium text-white text-[15px]">Document Chunks</span>
            <span className="text-[10px] font-mono bg-white/[0.06] text-white/60 px-2 py-0.5 rounded-full">
              {filteredChunks.length} records
            </span>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter chunks or source..."
              className="w-full bg-white/[0.04] border border-white/10 rounded-full pl-9 pr-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/30"
            />
          </div>
        </div>

        {/* Chunks List */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {filteredChunks.length === 0 ? (
            <div className="text-center py-12 text-white/40 text-xs font-mono">
              {loading ? 'Fetching vector chunks from database...' : 'No chunks match the current filter.'}
            </div>
          ) : (
            filteredChunks.map((chunk, index) => (
              <div
                key={chunk.id || index}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors flex flex-col gap-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11.5px] font-mono text-[#6799fe] truncate font-medium">
                    {chunk.source_file}
                  </span>
                  <span className="text-[10px] font-mono text-white/40 shrink-0">
                    Chunk #{index + 1}
                  </span>
                </div>
                <p className="text-[12.5px] text-white/70 font-mono leading-relaxed line-clamp-3">
                  {chunk.content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
