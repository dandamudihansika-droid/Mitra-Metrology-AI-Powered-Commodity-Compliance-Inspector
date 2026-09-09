import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sliders, CheckCircle2, Save, RotateCcw } from 'lucide-react';

export default function RuleManagementModal({ isOpen, onClose, theme }) {
  const isDark = theme === 'dark';

  const [rules, setRules] = useState([
    {
      id: "R-001",
      title: "Mandatory MRP Declaration",
      section: "LM(PC) Rules 2011 Sec 6(1)(e)",
      param: "Minimum Font Height",
      value: "3.0 mm",
      status: "Active",
    },
    {
      id: "R-002",
      title: "Full Manufacturer Postal Address",
      section: "LM(PC) Rules 2011 Sec 6(1)(c)",
      param: "Requires Pincode & Helpline",
      value: "Mandatory",
      status: "Active",
    },
    {
      id: "R-003",
      title: "Calorie & Nutritional Panel",
      section: "FSSAI Packaging Regulations 2020",
      param: "Per 100g / Per Serving",
      value: "Mandatory",
      status: "Active",
    },
  ]);

  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

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
              <Sliders className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-sm font-bold tracking-tight">Deterministic Rule Engine Manager</h3>
                <p className="text-[10px] font-mono text-zinc-500">Active Rule Version: LMPC-2026-v1.2</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-full border ${isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-zinc-100 border-zinc-300'}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Rule parameters saved & deployed across officer inspection nodes.</span>
            </div>
          )}

          {/* Rule Cards List */}
          <div className="space-y-3">
            {rules.map((rule, idx) => (
              <div
                key={rule.id}
                className={`p-4 rounded-2xl border text-xs space-y-2 ${
                  isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold">{rule.title}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {rule.status}
                  </span>
                </div>

                <p className="text-[10px] font-mono text-zinc-400">{rule.section}</p>

                <div className="flex justify-between items-center pt-1 border-t border-zinc-800/40 text-[11px]">
                  <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>{rule.param}</span>
                  <input
                    type="text"
                    value={rule.value}
                    onChange={(e) => {
                      const updated = [...rules];
                      updated[idx].value = e.target.value;
                      setRules(updated);
                    }}
                    className={`w-28 px-2 py-1 rounded border font-mono text-right text-xs focus:outline-none ${
                      isDark ? 'bg-black border-zinc-700 text-white' : 'bg-white border-zinc-300 text-black'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Action Bar */}
          <div className="pt-2 flex gap-3">
            <button
              onClick={handleSave}
              className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>Deploy Updated Rules</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
