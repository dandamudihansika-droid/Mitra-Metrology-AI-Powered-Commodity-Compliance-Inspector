import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertOctagon, ShieldAlert, Eye, Lock, Loader2 } from 'lucide-react';
import { formatISTDateTime } from '../utils/dateUtils';
import { fetchRecentInspections } from '../services/apiService';

export default function NonCompliantModal({ isOpen, onClose, onViewReport, theme }) {
  const isDark = theme === 'dark';
  const [nonCompliantList, setNonCompliantList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function loadViolations() {
      setLoading(true);
      try {
        const res = await fetchRecentInspections(50, 'non-compliant');
        const data = res && res.data ? res.data : Array.isArray(res) ? res : [];
        if (isMounted) setNonCompliantList(data);
      } catch (err) {
        console.warn('[NonCompliantModal] Failed to load live non-compliant records:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadViolations();
    return () => { isMounted = false; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`w-full max-w-md rounded-3xl border p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto ${
            isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-zinc-300 text-black'
          }`}
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
            <div className="flex items-center space-x-2">
              <AlertOctagon className="w-5 h-5 text-red-500" />
              <div>
                <h3 className="text-sm font-bold tracking-tight text-red-500">Non-Compliant Products</h3>
                <p className="text-[10px] font-mono text-zinc-500">Flagged LMPC Statutory Defects</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-full border ${isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-zinc-100 border-zinc-300'}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Non-Compliant Items List */}
          <div className="space-y-2.5">
            {loading ? (
              <div className="py-8 flex flex-col items-center justify-center space-y-2 text-xs font-mono text-zinc-400">
                <Loader2 className="w-5 h-5 animate-spin text-red-500" />
                <span>Fetching non-compliant database records...</span>
              </div>
            ) : nonCompliantList.length > 0 ? (
              nonCompliantList.map((insp) => (
                <div
                  key={insp.id}
                  onClick={() => {
                    onClose();
                    onViewReport(insp.id);
                  }}
                  className={`cursor-pointer p-4 rounded-2xl border text-xs space-y-2 transition-all ${
                    isDark ? 'bg-zinc-900/50 border-red-500/30 hover:border-red-500/60' : 'bg-red-50/50 border-red-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/30 text-[10px]">
                      {insp.id}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30">
                      ⚠ {insp.violationsCount || (insp.violations || []).length || 1} Violation(s)
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <h4 className="font-bold text-sm text-red-400">{insp.productName || insp.name}</h4>
                    <p className="text-[11px] text-zinc-400">{insp.manufacturer || "Manufacturer: Not declared"}</p>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-zinc-800/40 text-[10px] font-mono text-zinc-500">
                    <span>{insp.timestamp ? formatISTDateTime(insp.timestamp, ' • ') : `${insp.date} • ${insp.time}`}</span>
                    <span className="flex items-center space-x-1 text-red-400">
                      <Eye className="w-3 h-3" />
                      <span>View Evidence</span>
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center space-y-2 border border-dashed border-zinc-800 rounded-2xl">
                <ShieldAlert className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-xs font-semibold text-zinc-400">No non-compliant inspections found.</p>
                <p className="text-[10px] text-zinc-500">All scanned products meet Legal Metrology statutory standards.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
