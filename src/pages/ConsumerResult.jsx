import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, AlertTriangle, Flame, Activity, HeartPulse, Info, FileText, AlertOctagon, ShieldAlert } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import { mockProducts } from '../data/mockData';

export default function ConsumerResult({ scanResult, productId = 'prod-001', onBack, onReportConcern, theme, toggleTheme }) {
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState('calories');

  // Use dynamic scan result if available; otherwise fallback to mock dataset
  const product = scanResult || mockProducts.find(p => p.id === productId) || mockProducts[0];
  const isCompliant = product.status === 'compliant';

  const caloriesKcal = product.caloriesKcal ?? null;
  const servingKcal = product.servingKcal ?? (caloriesKcal ? Math.round(caloriesKcal / 2) : null);
  const rdaPercentage = product.rdaPercentage ?? (servingKcal ? Math.round((servingKcal / 2000) * 100) : null);

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
        <span className="text-sm font-bold tracking-tight">Scanned Package Details</span>
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </div>

      {/* Main Content */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm mx-auto my-auto space-y-5"
      >
        {/* Scanned Package Header Row */}
        <div className={`p-4 rounded-3xl border flex items-center space-x-4 ${
          isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
        }`}>
          <img
            src={product.image || "/package_back_label.png"}
            alt={product.name}
            className="w-16 h-16 rounded-2xl object-cover border border-zinc-700 bg-black"
          />
          <div className="flex-1 space-y-1">
            <h2 className="text-sm font-bold leading-snug">{product.name}</h2>
            <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              {product.netQuantity || "Net Qty: Not detected"} • {product.mrp || "MRP: Not detected"}
            </p>
            
            {/* Status Pill Badge */}
            <span className={`inline-flex items-center space-x-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
              isCompliant 
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' 
                : product.status === 'REVIEW_REQUIRED'
                ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                : 'bg-red-500/10 text-red-500 border-red-500/30'
            }`}>
              {isCompliant ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  <span>LMPC Compliant</span>
                </>
              ) : product.status === 'REVIEW_REQUIRED' ? (
                <>
                  <Info className="w-3 h-3 text-amber-400" />
                  <span>Manual Review Required</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3 h-3" />
                  <span>{product.violations ? product.violations.length : 1} Statutory Defects</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* DYNAMIC CALORIC & NUTRITIONAL CARD */}
        <div className={`p-5 rounded-3xl border relative overflow-hidden ${
          isDark 
            ? 'bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border-amber-500/30 shadow-[0_0_25px_rgba(245,158,11,0.15)]' 
            : 'bg-gradient-to-br from-amber-50/50 to-orange-50/30 border-amber-300 shadow-md text-black'
        }`}>
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-500 font-bold flex items-center space-x-1">
                <Flame className="w-3.5 h-3.5 fill-amber-500" />
                <span>ENERGY / CALORIE CONTENT</span>
              </span>
              <div className="flex items-baseline space-x-2 pt-1">
                {caloriesKcal !== null ? (
                  <>
                    <span className="text-3xl font-extrabold font-sans tracking-tight">{caloriesKcal}</span>
                    <span className="text-xs font-mono text-amber-400 font-semibold">kcal per 100g</span>
                  </>
                ) : (
                  <span className="text-sm font-semibold text-zinc-400 italic">Not detected on scanned label</span>
                )}
              </div>
              {servingKcal !== null && (
                <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  Per serving: <span className="font-bold text-white">{servingKcal} kcal</span>
                </p>
              )}
            </div>

            {/* Circular RDA Meter Badge */}
            {rdaPercentage !== null && (
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <span className="text-lg font-extrabold font-mono">{rdaPercentage}%</span>
                <span className="text-[9px] font-mono tracking-widest uppercase text-zinc-400">DAILY RDA</span>
              </div>
            )}
          </div>

          {/* % RDA Visual Meter Bar */}
          {rdaPercentage !== null && (
            <div className="space-y-1.5 mt-4 pt-3 border-t border-zinc-800/80">
              <div className="flex justify-between text-[10px] font-mono">
                <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>Daily Energy Budget (2,000 kcal)</span>
                <span className="font-bold text-amber-400">{servingKcal} / 2000 kcal</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" 
                  style={{ width: `${Math.min(rdaPercentage, 100)}%` }} 
                />
              </div>
            </div>
          )}
        </div>

        {/* Tab Buttons */}
        <div className={`p-1 rounded-2xl border flex ${
          isDark ? 'bg-zinc-950 border-zinc-850' : 'bg-zinc-100 border-zinc-300'
        }`}>
          <button
            onClick={() => setActiveTab('calories')}
            className={`w-1/2 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'calories'
                ? isDark ? 'bg-white text-black shadow-sm' : 'bg-black text-white shadow-sm'
                : isDark ? 'text-zinc-400' : 'text-zinc-600'
            }`}
          >
            Nutritional Info
          </button>
          <button
            onClick={() => setActiveTab('lmpc')}
            className={`w-1/2 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'lmpc'
                ? isDark ? 'bg-white text-black shadow-sm' : 'bg-black text-white shadow-sm'
                : isDark ? 'text-zinc-400' : 'text-zinc-600'
            }`}
          >
            LMPC Declarations
          </button>
        </div>

        {/* Tab 1: Full Nutritional Breakdown */}
        {activeTab === 'calories' ? (
          <div className={`rounded-3xl border overflow-hidden ${
            isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200'
          }`}>
            <div className="divide-y divide-zinc-800/40 text-xs">
              {(product.nutritionalInfo || []).map((item, idx) => (
                <div key={idx} className="p-3.5 flex justify-between items-center">
                  <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>{item.key}</span>
                  <span className="font-bold font-mono text-sm">{item.value}</span>
                </div>
              ))}
              <div className="p-3.5 flex justify-between items-center">
                <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>Customer Care Info</span>
                <span className="font-mono text-[11px] text-right font-semibold">{product.consumerCare || "Not detected on scanned label"}</span>
              </div>
            </div>
          </div>
        ) : (
          /* Tab 2: Extracted LMPC Declarations Matrix */
          <div className={`rounded-3xl border overflow-hidden ${
            isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200'
          }`}>
            <div className="divide-y divide-zinc-800/40 text-xs">
              <div className="p-3.5 flex justify-between">
                <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>Net Quantity</span>
                <span className="font-semibold">{product.netQuantity || "Not detected on scanned label"}</span>
              </div>
              <div className="p-3.5 flex justify-between">
                <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>MRP</span>
                <div className="text-right">
                  <span className="font-bold">{product.mrp || "Not detected on scanned label"}</span>
                  {product.mrpInclusive && <p className="text-[10px] text-zinc-500 font-mono">{product.mrpInclusive}</p>}
                </div>
              </div>
              <div className="p-3.5 flex justify-between">
                <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>Mfg Date</span>
                <span className="font-semibold">{product.manufacturingDate || "Not detected on scanned label"}</span>
              </div>
              <div className="p-3.5 flex justify-between">
                <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>Expiry Date</span>
                <span className="font-semibold">{product.expiryDate || "Not detected on scanned label"}</span>
              </div>
              <div className="p-3.5 flex justify-between">
                <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>Manufacturer</span>
                <span className="font-semibold text-right max-w-[180px]">{product.manufacturer || "Not detected on scanned label"}</span>
              </div>
              <div className="p-3.5 flex justify-between">
                <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>FSSAI License</span>
                <span className="font-mono font-semibold">{product.fssaiNo || "Not detected on scanned label"}</span>
              </div>
            </div>
          </div>
        )}

        {/* Verification Summary Card & Defect Action */}
        <div className={`p-4 rounded-2xl border space-y-3 ${
          isCompliant 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          <div className="flex items-center space-x-3.5">
            <div className="p-2 rounded-xl bg-black/40 border border-current shrink-0">
              {isCompliant ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <p className="text-xs font-semibold leading-relaxed">
              {isCompliant 
                ? "All statutory declarations (MRP, Net Quantity, Dates, FSSAI) pass Legal Metrology standards." 
                : `${product.violations ? product.violations.length : 1} statutory declaration defects detected on this package.`}
            </p>
          </div>

          {/* Action to file an official complaint/concern if defects detected */}
          {!isCompliant && (
            <button
              onClick={onReportConcern}
              className="w-full py-2.5 rounded-xl bg-red-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md hover:bg-red-600 transition-all"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>REPORT PACKAGE DEFAULT / DEFECT</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Action Footer */}
      <div className="w-full max-w-sm mx-auto pb-4 pt-2">
        <button
          onClick={() => alert(`Package Verification Summary:\nOCR Confidence: ${Math.round((product.ocrConfidence || 0.95) * 100)}%\nCaloric Intake: ${caloriesKcal ? `${caloriesKcal} kcal/100g` : 'Not detected'}\nLegal Metrology Rule Version: LMPC-2026-v1.2`)}
          className={`w-full py-3.5 rounded-xl font-bold text-xs tracking-wider uppercase transition-all ${
            isDark 
              ? 'bg-white text-black hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
              : 'bg-black text-white hover:bg-zinc-800 shadow-md'
          }`}
        >
          Export Verification Summary
        </button>
      </div>
    </div>
  );
}
