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
  Cpu
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlowButton } from '../components/ui/GlowButton';
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
        const data = await res.json();
        setNotification({
          type: 'success',
          message: `Indexed ${data.total_chunks} chunks across ${data.indexed_files} files in ${data.duration_ms}ms!`,
        });
        await fetchStatusAndChunks();
      } else {
        setNotification({ type: 'error', message: 'Reindexing failed.' });
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Could not reach backend service.' });
    } finally {
      setReindexing(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleClearCache = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/cache/clear`, { method: 'POST' });
      if (res.ok) {
        setNotification({ type: 'success', message: 'LRU Query Cache successfully flushed.' });
        await fetchStatusAndChunks();
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to clear cache.' });
    } finally {
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const filteredChunks = chunks.filter((c) =>
    c.content.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.source_file.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="py-8 px-4 max-w-6xl mx-auto pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Database className="w-8 h-8 text-amber-400" />
            Python & Pandas Knowledge Engine
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time ChromaDB collection telemetry for Python and Pandas 2.0+ documentation, chunk inspection, and vector indexing.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <GlowButton
            variant="amber"
            icon={RefreshCw}
            disabled={reindexing}
            onClick={handleReindex}
            className="text-xs sm:text-sm px-4 py-2"
          >
            {reindexing ? 'Reindexing...' : 'Rebuild Vector Index'}
          </GlowButton>

          <GlowButton
            variant="outline"
            icon={Trash2}
            onClick={handleClearCache}
            className="text-xs sm:text-sm px-4 py-2"
          >
            Clear Query Cache
          </GlowButton>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-xl mb-6 text-sm flex items-center gap-2.5 ${
            notification.type === 'success'
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
              : 'bg-red-500/15 text-red-300 border border-red-500/30'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <GlassCard className="p-4" hoverEffect={false}>
          <div className="text-xs text-slate-400 font-medium mb-1">Python & Pandas Chunks</div>
          <div className="text-2xl font-bold text-white font-mono">
            {status?.total_indexed_chunks ?? chunks.length} Chunks
          </div>
          <div className="text-[11px] text-cyan-400 mt-1">ChromaDB Persistent</div>
        </GlassCard>

        <GlassCard className="p-4" hoverEffect={false}>
          <div className="text-xs text-slate-400 font-medium mb-1">Cached Queries</div>
          <div className="text-2xl font-bold text-white font-mono">
            {status?.cache_stats?.current_size ?? 0} / {status?.cache_stats?.capacity ?? 256}
          </div>
          <div className="text-[11px] text-blue-400 mt-1">
            Hit Ratio: {status?.cache_stats?.hit_percentage ?? '0%'}
          </div>
        </GlassCard>

        <GlassCard className="p-4" hoverEffect={false}>
          <div className="text-xs text-slate-400 font-medium mb-1">Embedding Engine</div>
          <div className="text-lg font-bold text-white font-mono truncate">
            {status?.embedding_model ?? 'nomic-embed-text'}
          </div>
          <div className="text-[11px] text-indigo-400 mt-1">768-dim Cosine Space</div>
        </GlassCard>

        <GlassCard className="p-4" hoverEffect={false}>
          <div className="text-xs text-slate-400 font-medium mb-1">Ollama Model Backend</div>
          <div className="text-lg font-bold text-white font-mono truncate">
            {status?.active_model ?? 'llama3:8b'}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">
            Status: {status?.ollama_status ?? 'online'}
          </div>
        </GlassCard>
      </div>

      {/* Search and Chunks List */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <span>Document Chunks Inspection</span>
            <span className="text-xs font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
              {filteredChunks.length} chunks
            </span>
          </h3>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search content or file..."
              className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400/50"
            />
          </div>
        </div>

        {/* Chunks List */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {filteredChunks.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              {loading ? 'Loading chunks...' : 'No chunks match your search query.'}
            </div>
          ) : (
            filteredChunks.map((chunk) => (
              <div
                key={chunk.id}
                className="p-4 rounded-xl bg-slate-900/60 border border-white/5 hover:border-white/15 transition-colors"
              >
                <div className="flex items-center justify-between mb-2 text-xs">
                  <span className="font-semibold text-cyan-300 font-mono flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    {chunk.source_file}
                  </span>
                  <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                    <span>{chunk.char_count} chars</span>
                    <span className="px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                      Index #{chunk.chunk_index}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 font-mono leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-white/5 line-clamp-3">
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
