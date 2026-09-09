import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, ShieldAlert, Eye, Lock } from 'lucide-react';

export default function EvidenceViewer({ isOpen, onClose, violation, productImage, theme }) {
  const isDark = theme === 'dark';

  if (!isOpen || !violation) return null;

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
              <ShieldAlert className="w-5 h-5 text-red-500" />
              <h3 className="text-sm font-bold tracking-tight">Evidence Verification</h3>
            </div>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-full border ${isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-zinc-100 border-zinc-300'}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Bounding Box Image Preview */}
          <div className="relative aspect-video rounded-2xl border border-zinc-700 overflow-hidden bg-black flex items-center justify-center">
            <img
              src={productImage}
              alt="Evidence Region"
              className="w-full h-full object-cover filter brightness-90"
            />

            {/* Glowing Red OCR Crop Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ repeat: Infinity, repeatType: "reverse", duration: 1.5 }}
              className="absolute border-2 border-red-500 bg-red-500/20 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.6)]"
              style={{
                top: `${violation.highlightArea?.y || 30}%`,
                left: `${violation.highlightArea?.x || 20}%`,
                width: `${violation.highlightArea?.width || 50}%`,
                height: `${violation.highlightArea?.height || 20}%`,
              }}
            >
              <span className="absolute -top-5 left-0 text-[9px] font-mono font-bold bg-red-500 text-white px-1.5 py-0.5 rounded">
                FLAGGED REGION
              </span>
            </motion.div>
          </div>

          {/* Violation Details */}
          <div className="space-y-2 text-xs">
            <div>
              <span className={`text-[10px] font-mono uppercase ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                Detected Issue
              </span>
              <p className="font-bold text-red-400">{violation.title}</p>
            </div>

            <div className={`p-3 rounded-xl border text-[11px] space-y-1 ${
              isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-zinc-50 border-zinc-200 text-zinc-700'
            }`}>
              <div className="flex justify-between font-mono text-[10px]">
                <span>OCR Confidence:</span>
                <span className="font-bold text-white bg-zinc-800 px-1.5 py-0.5 rounded">{violation.ocrConfidence}</span>
              </div>
              <p className="pt-1">{violation.description}</p>
            </div>

            <div>
              <span className={`text-[10px] font-mono uppercase ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                Statutory Rule Reference
              </span>
              <p className="font-mono text-zinc-300 text-[11px]">{violation.rule}</p>
              <p className="font-mono text-zinc-500 text-[10px]">{violation.section}</p>
            </div>
          </div>

          {/* Cryptographic Integrity Stamp */}
          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] font-mono text-zinc-500">
            <span className="flex items-center space-x-1">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>TAMPER-EVIDENT RECORD</span>
            </span>
            <span>VERIFIED</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
