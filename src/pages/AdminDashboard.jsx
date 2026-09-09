import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldAlert, BarChart3, AlertOctagon, Users, FileCheck2, Sliders, CheckCircle2 } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import { mockAnomalies } from '../data/mockData';

export default function AdminDashboard({ onBack, theme, toggleTheme }) {
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen p-6 pb-24 transition-colors duration-300 ${
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
        <span className="text-xs font-mono tracking-widest uppercase">REGULATORY SUPERVISOR SUITE</span>
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </div>

      <div className="max-w-md mx-auto space-y-6 mt-4">
        {/* Header Title */}
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight">Supervisor Dashboard</h1>
          <p className={`text-xs font-mono ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Regulatory Intelligence & Audit Trails
          </p>
        </div>

        {/* Global Statistics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
            <span className="text-[10px] font-mono uppercase text-zinc-500">TOTAL INSPECTIONS</span>
            <p className="text-xl font-bold mt-1">24,891</p>
          </div>

          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
            <span className="text-[10px] font-mono uppercase text-zinc-500">COMPLIANT</span>
            <p className="text-xl font-bold text-emerald-400 mt-1">20,699</p>
          </div>

          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
            <span className="text-[10px] font-mono uppercase text-zinc-500">NON-COMPLIANT</span>
            <p className="text-xl font-bold text-red-500 mt-1">4,192</p>
          </div>

          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
            <span className="text-[10px] font-mono uppercase text-zinc-500">COMPLAINTS LOGGED</span>
            <p className="text-xl font-bold text-amber-400 mt-1">327</p>
          </div>
        </div>

        {/* AI Inspection Anomaly Engine Section */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-mono uppercase tracking-wider font-bold">
              Inspection Integrity Risk Indicators
            </h3>
          </div>

          <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Flags anomalous pattern signals requiring supervisory review (unusual duration, missing evidence, excess corrections).
          </p>

          <div className="space-y-2.5">
            {mockAnomalies.map((item, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border text-xs space-y-2 ${
                  item.flaggedLevel === 'High Risk'
                    ? isDark ? 'bg-zinc-950 border-red-500/40' : 'bg-red-50/40 border-red-200'
                    : isDark ? 'bg-zinc-950 border-zinc-850' : 'bg-zinc-50 border-zinc-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold">{item.officerId}</span>
                    <span className="text-zinc-400">({item.name})</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    item.flaggedLevel === 'High Risk'
                      ? 'bg-red-500 text-white'
                      : item.flaggedLevel === 'Low Risk'
                      ? 'bg-amber-500 text-black'
                      : 'bg-emerald-500 text-white'
                  }`}>
                    {item.flaggedLevel}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-zinc-400 pt-1">
                  <div>Inspections: <span className="text-white font-bold">{item.inspectionsCount}</span></div>
                  <div>Avg Duration: <span className="text-white font-bold">{item.avgDurationMin}</span></div>
                  <div>Corrections: <span className="text-white font-bold">{item.correctionsCount}</span></div>
                </div>

                <p className="text-[10px] font-mono text-zinc-500 italic">
                  Signal: {item.reason}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Rule Version Activation Box */}
        <div className={`p-4 rounded-2xl border space-y-3 ${
          isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-100 border-zinc-300'
        }`}>
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span className="font-bold">Active Rule Engine</span>
            </div>
            <span className="font-mono text-emerald-400 font-bold">LMPC-2026-v1.2</span>
          </div>
          <button
            onClick={() => alert("Rule Version LMPC-2026-v1.2 re-verified across active nodes.")}
            className={`w-full py-2.5 rounded-xl text-xs font-bold ${
              isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'
            }`}
          >
            Manage Compliance Rules
          </button>
        </div>
      </div>
    </div>
  );
}
