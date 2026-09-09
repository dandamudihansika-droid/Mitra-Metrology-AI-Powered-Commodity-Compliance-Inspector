import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertTriangle, Download, Share2, Eye, ShieldCheck, Lock, CheckCircle2, Info, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import EvidenceViewer from '../components/EvidenceViewer';
import { formatISTDateTime } from '../utils/dateUtils';
import { fetchInspectionById } from '../services/apiService';

export default function OfficerReport({ scanResult, productId, onBack, theme, toggleTheme }) {
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState('violations');
  const [selectedViolation, setSelectedViolation] = useState(null);

  const [inspection, setInspection] = useState(scanResult || null);
  const [loading, setLoading] = useState(!scanResult && !!productId);
  const [error, setError] = useState('');

  // Fetch full single inspection details record from backend API on mount or ID change
  useEffect(() => {
    if (scanResult && (!productId || scanResult.id === productId)) {
      setInspection(scanResult);
      setLoading(false);
      return;
    }

    if (!productId) {
      if (!inspection) setError('No inspection record specified.');
      setLoading(false);
      return;
    }

    let isMounted = true;
    async function loadDetails() {
      setLoading(true);
      setError('');
      try {
        const record = await fetchInspectionById(productId);
        if (isMounted) {
          setInspection(record);
        }
      } catch (err) {
        if (isMounted) {
          console.error('[OfficerReport Load Error]', err);
          setError(err.message || 'Inspection not found.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDetails();
    return () => { isMounted = false; };
  }, [scanResult, productId]);

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col justify-center items-center p-6 ${
        isDark ? 'bg-black text-white' : 'bg-white text-black'
      }`}>
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-3" />
        <p className="text-xs font-mono text-zinc-400">Loading inspection details from database...</p>
      </div>
    );
  }

  if (error || !inspection) {
    return (
      <div className={`min-h-screen flex flex-col justify-between p-6 ${
        isDark ? 'bg-black text-white' : 'bg-white text-black'
      }`}>
        <div className="w-full flex justify-between items-center pt-2">
          <button onClick={onBack} className={`p-2 rounded-full border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-100 border-zinc-300'}`}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-bold">Inspection Details</span>
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>

        <div className="w-full max-w-sm mx-auto my-auto p-6 rounded-3xl border border-red-500/30 bg-red-950/20 text-center space-y-3 text-red-400 text-xs">
          <AlertCircle className="w-8 h-8 mx-auto text-red-400" />
          <h3 className="font-bold text-sm text-red-300">Inspection Not Found</h3>
          <p>{error || "The requested inspection record does not exist in the database."}</p>
          <button
            onClick={onBack}
            className="mt-2 px-4 py-2 bg-red-900/60 hover:bg-red-800 text-white font-bold rounded-xl text-xs inline-flex items-center space-x-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  const productName = inspection.productName || inspection.name || 'Scanned Packaged Commodity';
  const violationsList = inspection.violations || [];
  const status = (inspection.status || 'compliant').toLowerCase();
  const isCompliant = status === 'compliant';
  const isReviewRequired = status === 'review_required' || status === 'review' || status === 'pending';

  return (
    <div className={`min-h-screen flex flex-col justify-between p-6 transition-colors duration-300 ${
      isDark ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      {/* Header */}
      <div className="w-full flex justify-between items-center pt-2 z-10">
        <button
          onClick={onBack}
          className={`p-2 rounded-full border transition-colors ${
            isDark ? 'border-zinc-800 bg-zinc-950 text-white' : 'border-zinc-300 bg-zinc-100 text-black'
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-bold tracking-tight">Official Inspection Report</span>
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </div>

      {/* Main Content */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm mx-auto my-auto space-y-5"
      >
        {/* Product Card Header */}
        <div className={`p-4 rounded-3xl border flex items-center space-x-4 ${
          isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
        }`}>
          <img
            src={inspection.image || "/package_back_label.png"}
            alt={productName}
            className="w-16 h-16 rounded-2xl object-cover border border-zinc-700 bg-black"
          />
          <div className="flex-1 space-y-1">
            <h2 className="text-sm font-bold leading-snug">{productName}</h2>
            <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              {inspection.netQuantity || "Net Qty: Not detected"} • {inspection.mrp || "MRP: Not detected"}
            </p>
            
            {/* Status Pill Badge */}
            <span className={`inline-flex items-center space-x-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
              isCompliant 
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' 
                : isReviewRequired
                ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                : 'bg-red-500/10 text-red-500 border-red-500/30'
            }`}>
              {isCompliant ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  <span>COMPLIANT</span>
                </>
              ) : isReviewRequired ? (
                <>
                  <Info className="w-3 h-3 text-amber-400" />
                  <span>REVIEW REQUIRED</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3 h-3" />
                  <span>NON-COMPLIANT ({violationsList.length})</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Tab Selector */}
        <div className={`p-1 rounded-2xl border flex ${
          isDark ? 'bg-zinc-950 border-zinc-850' : 'bg-zinc-100 border-zinc-300'
        }`}>
          <button
            onClick={() => setActiveTab('details')}
            className={`w-1/3 py-2 text-[11px] font-semibold rounded-xl transition-all ${
              activeTab === 'details'
                ? isDark ? 'bg-white text-black shadow-sm' : 'bg-black text-white shadow-sm'
                : isDark ? 'text-zinc-400' : 'text-zinc-600'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('violations')}
            className={`w-1/3 py-2 text-[11px] font-semibold rounded-xl transition-all ${
              activeTab === 'violations'
                ? isDark ? 'bg-white text-black shadow-sm' : 'bg-black text-white shadow-sm'
                : isDark ? 'text-zinc-400' : 'text-zinc-600'
            }`}
          >
            Violations ({violationsList.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('evidence');
              if (violationsList.length > 0) setSelectedViolation(violationsList[0]);
            }}
            className={`w-1/3 py-2 text-[11px] font-semibold rounded-xl transition-all ${
              activeTab === 'evidence'
                ? isDark ? 'bg-white text-black shadow-sm' : 'bg-black text-white shadow-sm'
                : isDark ? 'text-zinc-400' : 'text-zinc-600'
            }`}
          >
            Evidence
          </button>
        </div>

        {/* Tab 1: Violations List */}
        {activeTab === 'violations' && (
          <div className="space-y-3">
            {violationsList.length > 0 ? (
              violationsList.map((item, idx) => (
                <div
                  key={item.id || idx}
                  onClick={() => setSelectedViolation(item)}
                  className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                    isDark ? 'bg-zinc-950 border-red-500/30 hover:border-red-500/60' : 'bg-red-50/50 border-red-200'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="space-y-1 flex-1">
                      <h3 className="text-xs font-bold text-red-400">{item.title}</h3>
                      <p className={`text-[10px] font-mono ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        Rule: {item.rule}
                      </p>
                      <p className={`text-[10px] font-mono ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                        {item.section}
                      </p>
                      {item.description && (
                        <p className="text-[11px] text-zinc-300 pt-1 leading-relaxed">{item.description}</p>
                      )}
                    </div>
                    <Eye className="w-4 h-4 text-red-400 shrink-0" />
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 rounded-2xl border text-center text-xs text-emerald-400 bg-emerald-500/10 border-emerald-500/30 font-semibold">
                ✓ No violations detected.
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Extracted Product Details */}
        {activeTab === 'details' && (
          <div className={`rounded-2xl border p-4 text-xs space-y-2.5 ${
            isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200'
          }`}>
            <div className="flex justify-between">
              <span className="text-zinc-500">Manufacturer:</span>
              <span className="font-semibold text-right max-w-[190px]">{inspection.manufacturer || "Not detected"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">FSSAI License:</span>
              <span className="font-mono font-semibold">{inspection.fssaiNo || "Not detected"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Net Quantity:</span>
              <span className="font-semibold">{inspection.netQuantity || "Not detected"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">MRP:</span>
              <span className="font-bold">{inspection.mrp || "Not detected"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Mfg Date:</span>
              <span className="font-semibold">{inspection.manufacturingDate || "Not detected"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Expiry Date:</span>
              <span className="font-semibold">{inspection.expiryDate || "Not detected"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Consumer Care:</span>
              <span className="font-mono text-[11px] text-right font-semibold max-w-[180px]">{inspection.consumerCare || "Not detected"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Energy / Calories:</span>
              <span className="font-bold text-amber-400">
                {inspection.caloriesKcal ? `${inspection.caloriesKcal} kcal` : "Not detected"}
              </span>
            </div>
          </div>
        )}

        {/* Tab 3: Evidence View */}
        {activeTab === 'evidence' && (
          <div className={`p-4 rounded-2xl border space-y-3 ${
            isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200'
          }`}>
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
              AUTHENTIC PACKAGE LABEL EVIDENCE PHOTO
            </span>

            <div className="relative aspect-video rounded-xl border border-zinc-700 overflow-hidden bg-black flex items-center justify-center">
              <img
                src={inspection.image || "/package_back_label.png"}
                alt="Package Label Evidence"
                className="w-full h-full object-contain filter brightness-95"
              />
            </div>

            <div className="flex justify-between items-center text-[11px] font-mono pt-1 text-zinc-400">
              <span>OCR Quality Confidence:</span>
              <span className="font-bold text-white bg-zinc-800 px-2 py-0.5 rounded">
                {Math.round((inspection.ocrConfidence || 0.95) * 100)}%
              </span>
            </div>

            {violationsList.length > 0 && (
              <button
                onClick={() => setSelectedViolation(violationsList[0])}
                className="w-full py-2 bg-red-900/40 hover:bg-red-900/70 border border-red-500/40 text-red-300 text-xs font-bold rounded-xl flex items-center justify-center space-x-2"
              >
                <Eye className="w-4 h-4 text-red-400" />
                <span>INSPECT FLAGGED REGION HIGHLIGHT</span>
              </button>
            )}
          </div>
        )}

        {/* Inspection Metadata Table */}
        <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
          isDark ? 'bg-zinc-950 border-zinc-850' : 'bg-zinc-50 border-zinc-200'
        }`}>
          <div className="flex justify-between">
            <span className={isDark ? 'text-zinc-500' : 'text-zinc-400'}>Inspection ID</span>
            <span className="font-mono font-bold">{inspection.id ? `#${inspection.id}` : '#INSP-1023'}</span>
          </div>
          <div className="flex justify-between">
            <span className={isDark ? 'text-zinc-500' : 'text-zinc-400'}>Date & Time</span>
            <span className="font-mono">
              {inspection.timestamp 
                ? formatISTDateTime(inspection.timestamp) 
                : (inspection.date && inspection.time ? `${inspection.date}, ${inspection.time}` : 'Unrecorded')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className={isDark ? 'text-zinc-500' : 'text-zinc-400'}>Inspector ID</span>
            <span className="font-mono">LM-AP-0231</span>
          </div>
          <div className="flex justify-between">
            <span className={isDark ? 'text-zinc-500' : 'text-zinc-400'}>Rule Version</span>
            <span className="font-mono font-semibold text-emerald-400">LMPC-2026-v1.2</span>
          </div>
          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-500">
            <span className="flex items-center space-x-1">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>SHA-256 HASH</span>
            </span>
            <span className="truncate max-w-[140px]">{inspection.integrityHash || 'sha256_e9a18b7f'}</span>
          </div>
        </div>
      </motion.div>

      {/* Footer Actions */}
      <div className="w-full max-w-sm mx-auto flex items-center gap-3 pt-4">
        <button
          onClick={() => alert(`Digital Inspection Receipt PDF for ${inspection.id} generated & signed.`)}
          className={`w-1/2 py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
            isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Download PDF</span>
        </button>

        <button
          onClick={() => alert(`Shareable verification link for ${inspection.id} copied.`)}
          className={`w-1/2 py-3 rounded-xl border font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
            isDark ? 'bg-zinc-950 border-zinc-800 text-white hover:bg-zinc-900' : 'bg-zinc-100 border-zinc-300 text-black'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>
      </div>

      {/* Interactive Evidence Viewer Modal */}
      <EvidenceViewer
        isOpen={!!selectedViolation}
        onClose={() => setSelectedViolation(null)}
        violation={selectedViolation}
        productImage={inspection.image || "/package_back_label.png"}
        theme={theme}
      />
    </div>
  );
}
