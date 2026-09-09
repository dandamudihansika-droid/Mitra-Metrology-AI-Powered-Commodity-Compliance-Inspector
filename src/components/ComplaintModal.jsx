import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, ShieldAlert, Send } from 'lucide-react';

export default function ComplaintModal({ isOpen, onClose, onSubmit, theme }) {
  const isDark = theme === 'dark';
  const [category, setCategory] = useState('Official result appears incorrect');
  const [details, setDetails] = useState('');
  const [submittedId, setSubmittedId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const categories = [
    "Inspection not conducted",
    "Official result appears incorrect",
    "Requested unofficial payment",
    "Evidence appears incorrect",
    "Other"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    try {
      const result = await onSubmit({ description: `${category}: ${details}`, priority: category.includes('payment') ? 'HIGH' : 'NORMAL' });
      setSubmittedId(result.data.id);
    } catch (error) {
      setErrorMessage(error.message || 'Unable to submit complaint.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`w-full max-w-sm rounded-3xl border p-6 space-y-4 shadow-2xl ${
            isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-zinc-300 text-black'
          }`}
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold tracking-tight">Report an Inspection Concern</h3>
            </div>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-full border ${isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-zinc-100 border-zinc-300'}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {!submittedId ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <p className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>
                Submit an evidence-linked concern for supervisor review. Confidential & digitally tracked.
              </p>

              <div className="space-y-1.5">
                <label className="font-mono uppercase text-[10px] text-zinc-400">Concern Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full p-3 rounded-xl border font-sans focus:outline-none ${
                    isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-100 border-zinc-300 text-black'
                  }`}
                >
                  {categories.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono uppercase text-[10px] text-zinc-400">Additional Details & Evidence</label>
                <textarea
                  rows={3}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Provide context or scan reference..."
                  className={`w-full p-3 rounded-xl border font-sans focus:outline-none placeholder:text-zinc-600 ${
                    isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-100 border-zinc-300 text-black'
                  }`}
                />
              </div>

              <button
                type="submit"
                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all ${
                  isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? 'Saving...' : 'Submit Concern'}</span>
              </button>
              {errorMessage && <p className="text-red-400">{errorMessage}</p>}
            </form>
          ) : (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 mx-auto flex items-center justify-center">
                ✓
              </div>
              <h4 className="text-base font-bold">Concern Logged</h4>
              <p className="text-xs text-zinc-400 font-mono">Reference ID: <span className="text-white font-bold">{submittedId}</span></p>
              <p className="text-[11px] text-zinc-500">Assigned to Supervisory Audit Desk.</p>
              <button
                onClick={onClose}
                className={`w-full py-2.5 rounded-xl font-bold text-xs ${
                  isDark ? 'bg-zinc-900 border border-zinc-700 text-white' : 'bg-zinc-100 border border-zinc-300 text-black'
                }`}
              >
                Done
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
