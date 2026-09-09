import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  FileText,
  CheckCircle,
  AlertTriangle,
  ScanLine
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function ConsumerScans({
  inspections,
  onBack,
  onViewResult,
  onStartScan,
  theme,
  toggleTheme
}) {
  const isDark = theme === 'dark';

  const scans = Array.isArray(inspections)
    ? inspections
    : [];

  return (
    <div
      className={`min-h-screen pb-10 transition-colors duration-300 ${
        isDark ? 'bg-black text-white' : 'bg-white text-black'
      }`}
    >
      {/* Header */}
      <div className="p-6 flex justify-between items-center">
        <button
          onClick={onBack}
          className={`p-2 rounded-full border ${
            isDark
              ? 'bg-zinc-950 border-zinc-800'
              : 'bg-zinc-100 border-zinc-300'
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h1 className="text-lg font-bold">
          My Scans
        </h1>

        <ThemeToggle
          theme={theme}
          toggleTheme={toggleTheme}
        />
      </div>

      <div className="px-6 space-y-5">
        <div>
          <p
            className={`text-xs font-mono uppercase tracking-wider ${
              isDark ? 'text-zinc-500' : 'text-zinc-500'
            }`}
          >
            Inspection History
          </p>

          <h2 className="text-2xl font-extrabold mt-1">
            {scans.length} Scan{scans.length !== 1 ? 's' : ''}
          </h2>
        </div>

        {scans.length === 0 ? (
          /* Empty state */
          <div
            className={`rounded-3xl border p-8 text-center ${
              isDark
                ? 'bg-zinc-950 border-zinc-800'
                : 'bg-zinc-50 border-zinc-200'
            }`}
          >
            <FileText className="w-10 h-10 mx-auto text-zinc-500" />

            <h3 className="font-bold mt-4">
              No scans yet
            </h3>

            <p className="text-xs text-zinc-500 mt-2">
              Scan a packaged product to see your inspection
              history here.
            </p>

            <button
              onClick={onStartScan}
              className={`mt-5 px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 mx-auto ${
                isDark
                  ? 'bg-white text-black'
                  : 'bg-black text-white'
              }`}
            >
              <ScanLine className="w-4 h-4" />
              Scan Product
            </button>
          </div>
        ) : (
          /* Scan list */
          <div className="space-y-3">
            {scans.map((scan, index) => {
              const status =
                String(scan.status || '').toLowerCase();

              const hasIssues =
                status.includes('review') ||
                status.includes('non') ||
                Number(scan.violationsCount || 0) > 0;

              return (
                <motion.button
                  key={scan.id || index}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    onViewResult(scan.id || scan.productId)
                  }
                  className={`w-full text-left p-4 rounded-2xl border flex items-center justify-between ${
                    isDark
                      ? 'bg-zinc-950 border-zinc-800 hover:border-zinc-600'
                      : 'bg-zinc-50 border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-xl border ${
                        isDark
                          ? 'bg-zinc-900 border-zinc-800'
                          : 'bg-white border-zinc-200'
                      }`}
                    >
                      {hasIssues ? (
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-bold">
                        {scan.productName ||
                          scan.name ||
                          'Packaged Product'}
                      </h3>

                      <p className="text-[10px] text-zinc-500 mt-1">
                        {scan.manufacturer ||
                          'Manufacturer not available'}
                      </p>

                      <p className="text-[10px] text-zinc-500">
                        {scan.date || 'Date unavailable'}
                        {scan.time
                          ? ` • ${scan.time}`
                          : ''}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      hasIssues
                        ? 'bg-red-500/10 text-red-500'
                        : 'bg-emerald-500/10 text-emerald-500'
                    }`}
                  >
                    {hasIssues
                      ? 'Review'
                      : 'Compliant'}
                  </span>
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Scan Again */}
        {scans.length > 0 && (
          <button
            onClick={onStartScan}
            className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 ${
              isDark
                ? 'bg-white text-black'
                : 'bg-black text-white'
            }`}
          >
            <ScanLine className="w-4 h-4" />
            Scan Another Product
          </button>
        )}
      </div>
    </div>
  );
}