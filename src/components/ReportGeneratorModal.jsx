import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileSpreadsheet, Download, Printer, CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';
import { formatISTDateTime } from '../utils/dateUtils';

export default function ReportGeneratorModal({ isOpen, onClose, theme, inspection }) {
  const isDark = theme === 'dark';
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert("PDF Digital Inspection Certificate successfully exported to downloads folder!");
    }, 1500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`w-full max-w-md rounded-3xl border p-6 space-y-4 shadow-2xl ${
            isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-zinc-300 text-black'
          }`}
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="w-5 h-5 text-white" />
              <div>
                <h3 className="text-sm font-bold tracking-tight">Official Inspection Receipt Exporter</h3>
                <p className="text-[10px] font-mono text-zinc-500">Legal Metrology Certificate</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-full border ${isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-zinc-100 border-zinc-300'}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Printable Receipt Card Mockup */}
          <div className={`p-4 rounded-2xl border font-mono text-xs space-y-3 ${
            isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-zinc-100 border-zinc-300'
          }`}>
            <div className="text-center space-y-1 pb-2 border-b border-zinc-800">
              <p className="font-extrabold text-sm tracking-wider">MITRA METROLOGY</p>
              <p className="text-[10px] text-zinc-400">OFFICIAL INSPECTION RECEIPT</p>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-zinc-500">Inspection ID:</span>
                <span className="font-bold">INSP-1023</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Officer ID:</span>
                <span>LM-AP-0231</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Timestamp:</span>
                <span>{formatISTDateTime(inspection?.timestamp || new Date(), ' / ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Product Inspected:</span>
                <span className="font-bold text-red-400">Maggi Noodles 70g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Compliance Verdict:</span>
                <span className="font-bold text-red-500">NON-COMPLIANT (2 Violations)</span>
              </div>
            </div>

            {/* QR Code Verification Box */}
            <div className="p-3 rounded-xl bg-black border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <QrCode className="w-8 h-8 text-white" />
                <div>
                  <p className="text-[10px] font-bold text-white">PUBLIC VERIFICATION QR</p>
                  <p className="text-[9px] text-zinc-500">Scan to view audit evidence</p>
                </div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
          </div>

          {/* Export Action Buttons */}
          <div className="pt-2 flex gap-3">
            <button
              onClick={handleExport}
              disabled={downloading}
              className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'Generating PDF...' : 'Download Signed PDF Receipt'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
