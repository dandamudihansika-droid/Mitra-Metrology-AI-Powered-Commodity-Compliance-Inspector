import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, History, Search, ShieldCheck, Lock, CheckCircle2, AlertTriangle, Info, Loader2, ChevronLeft, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import { formatISTDateTime } from '../utils/dateUtils';
import { fetchRecentInspections } from '../services/apiService';

export default function InspectionHistoryModal({ isOpen, onClose, onViewReport, theme }) {
  const isDark = theme === 'dark';
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  const [records, setRecords] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load records from real backend database
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function loadHistory() {
      setLoading(true);
      setError('');
      try {
        const res = await fetchRecentInspections(10, statusFilter, query, page, 'newest');
        if (isMounted) {
          if (res && res.data) {
            setRecords(res.data);
            setTotalPages(res.totalPages || 1);
            setTotalCount(res.total || res.data.length);
          } else if (Array.isArray(res)) {
            setRecords(res);
            setTotalPages(1);
            setTotalCount(res.length);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('[Inspection History Error]', err);
          setError('Unable to load inspection history. Please try again.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      loadHistory();
    }, query ? 300 : 0);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isOpen, query, statusFilter, page]);

  if (!isOpen) return null;

  const handleStatusTab = (status) => {
    setStatusFilter(status);
    setPage(1);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`w-full max-w-md rounded-3xl border p-6 space-y-4 shadow-2xl max-h-[88vh] flex flex-col justify-between ${
            isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-zinc-300 text-black'
          }`}
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
            <div className="flex items-center space-x-2">
              <History className="w-5 h-5 text-white" />
              <div>
                <h3 className="text-sm font-bold tracking-tight">Inspection Audit Log</h3>
                <p className="text-[10px] font-mono text-zinc-500">
                  {totalCount} Total Database Records • IST Timezone
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-full border ${isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-zinc-100 border-zinc-300'}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search Bar */}
          <div className={`flex items-center px-3 py-2.5 rounded-xl border text-xs ${
            isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-100 border-zinc-300 text-black'
          }`}>
            <Search className="w-4 h-4 text-zinc-400 mr-2 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by ID, Product, Manufacturer, FSSAI..."
              className="w-full bg-transparent focus:outline-none placeholder:text-zinc-500"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-zinc-500 hover:text-white text-xs ml-1">
                Clear
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-1 overflow-x-auto pb-1 text-[11px] font-semibold no-scrollbar">
            {[
              { id: 'all', label: 'All' },
              { id: 'compliant', label: 'Compliant' },
              { id: 'non-compliant', label: 'Non-Compliant' },
              { id: 'review_required', label: 'Review Required' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => handleStatusTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl border whitespace-nowrap transition-all ${
                  statusFilter === tab.id
                    ? isDark 
                      ? 'bg-white text-black border-white font-bold' 
                      : 'bg-black text-white border-black font-bold'
                    : isDark 
                      ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700' 
                      : 'bg-zinc-100 border-zinc-300 text-zinc-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Log List */}
          <div className="space-y-2.5 overflow-y-auto flex-1 pr-1 min-h-[220px]">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-2 text-xs font-mono text-zinc-400">
                <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                <span>Loading real inspection records...</span>
              </div>
            ) : error ? (
              <div className="p-4 rounded-2xl border border-red-500/30 bg-red-950/20 text-red-400 text-xs space-y-2 text-center">
                <AlertCircle className="w-5 h-5 mx-auto" />
                <p>{error}</p>
                <button
                  onClick={() => setPage(1)}
                  className="px-3 py-1 bg-red-900/60 hover:bg-red-800 text-white rounded-lg text-[11px] font-semibold inline-flex items-center space-x-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry Connection</span>
                </button>
              </div>
            ) : records.length > 0 ? (
              records.map((insp) => (
                <div
                  key={insp.id}
                  onClick={() => {
                    onClose();
                    onViewReport(insp.id);
                  }}
                  className={`cursor-pointer p-3.5 rounded-2xl border text-xs space-y-2 transition-all ${
                    isDark ? 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-600' : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px]">
                      {insp.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      insp.status === 'compliant'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : insp.status === 'REVIEW_REQUIRED' || insp.status === 'review'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-red-500/10 text-red-400 border-red-500/30'
                    }`}>
                      {insp.status === 'compliant' 
                        ? '✓ COMPLIANT' 
                        : insp.status === 'REVIEW_REQUIRED' || insp.status === 'review'
                        ? '⚠ REVIEW REQUIRED'
                        : `⚠ NON-COMPLIANT (${insp.violationsCount || (insp.violations || []).length})`}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <h4 className="font-bold text-xs leading-snug">{insp.productName || insp.name}</h4>
                    <p className="text-[11px] text-zinc-400 truncate max-w-[280px]">
                      {insp.manufacturer || "Manufacturer: Not declared"}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-zinc-800/40 text-[10px] font-mono text-zinc-500">
                    <span>
                      {insp.timestamp 
                        ? formatISTDateTime(insp.timestamp, ' • ') 
                        : (insp.date && insp.time ? `${insp.date} • ${insp.time}` : 'Date unrecorded')}
                    </span>
                    <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
                      <Lock className="w-3 h-3" />
                      <span>DETAILS →</span>
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs font-mono text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
                No inspections found.
              </div>
            )}
          </div>

          {/* Pagination Bar */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center pt-3 border-t border-zinc-800 text-xs font-mono">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border bg-zinc-900 border-zinc-800 disabled:opacity-40 flex items-center space-x-1 hover:bg-zinc-800"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <span className="text-zinc-400">
                Page <strong className="text-white">{page}</strong> of {totalPages}
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border bg-zinc-900 border-zinc-800 disabled:opacity-40 flex items-center space-x-1 hover:bg-zinc-800"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
