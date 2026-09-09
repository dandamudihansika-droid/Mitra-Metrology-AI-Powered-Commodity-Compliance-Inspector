import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Bell, Scan, History, AlertOctagon, FileSpreadsheet, Sliders, BarChart2, PlusCircle, CheckCircle2, AlertTriangle, ArrowRight, UserCheck } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import BottomNav from '../components/BottomNav';
import RuleManagementModal from '../components/RuleManagementModal';
import InspectionHistoryModal from '../components/InspectionHistoryModal';
import ReportGeneratorModal from '../components/ReportGeneratorModal';
import NonCompliantModal from '../components/NonCompliantModal';
import { mockOfficerStats, mockRecentInspections, getTodayInspectionsCount } from '../data/mockData';
import { formatISTDateTime } from '../utils/dateUtils';
import { fetchDashboardStats } from '../services/apiService';
import ComplaintQueue from '../components/ComplaintQueue';

export default function OfficerDashboard({ officerSession, onStartScan, onViewReport, onOpenAdminSuite, onNavigateProfile, theme, toggleTheme, inspections = [] }) {
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState('home');

  // Modal active states
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isNonCompliantModalOpen, setIsNonCompliantModalOpen] = useState(false);

  // Real Backend Dashboard Statistics State
  const [apiStats, setApiStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      try {
        const data = await fetchDashboardStats();
        if (isMounted && data) {
          setApiStats(data);
        }
      } catch (err) {
        console.warn('[OfficerDashboard] Failed to fetch live backend stats:', err.message);
      } finally {
        if (isMounted) setLoadingStats(false);
      }
    }
    loadStats();
    return () => { isMounted = false; };
  }, [inspections]);

  // Compute live statistics based on API or inspections array
  const totalInspections = apiStats ? apiStats.totalInspections : inspections.length;
  const totalViolations = apiStats ? apiStats.totalViolations : inspections.reduce((acc, i) => acc + (i.violationsCount || (i.violations || []).length), 0);
  const todayInspections = apiStats ? apiStats.todayInspections : getTodayInspectionsCount(inspections);
  const pendingInspections = apiStats ? apiStats.pendingInspections : inspections.filter(i => i.status === 'review' || i.status === 'pending').length;

  const officerInfo = officerSession || {
    officerId: mockOfficerStats.officerId,
    officerName: mockOfficerStats.officerName,
    mobile: "+91 98765 43210",
    zone: mockOfficerStats.zone,
    badge: "VERIFIED LMPC AUDITOR"
  };

  const actionCards = [
    { id: 'scan', title: 'Scan Product', subtitle: 'Inspect & verify label', icon: Scan, action: onStartScan },
    { id: 'history', title: 'Inspection History', subtitle: 'Search past logs', icon: History, action: () => setIsHistoryModalOpen(true) },
    { id: 'violations', title: 'Non-Compliant Products', subtitle: 'Flagged evidence', icon: AlertOctagon, action: () => setIsNonCompliantModalOpen(true) },
    { id: 'reports', title: 'Reports & Export', subtitle: 'Generate PDF receipt', icon: FileSpreadsheet, action: () => setIsReportModalOpen(true) },
    { id: 'rules', title: 'Rule Management', subtitle: 'Configure parameters', icon: Sliders, action: () => setIsRuleModalOpen(true) },
    { id: 'analytics', title: 'Supervisor Suite', subtitle: 'AI Anomaly engine', icon: BarChart2, action: onOpenAdminSuite },
  ];

  return (
    <div className={`min-h-screen pb-24 transition-colors duration-300 ${
      isDark ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      {/* Header */}
      <div className="p-6 pb-2 flex justify-between items-center z-10">
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-2xl border ${
            isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-zinc-100 border-zinc-300 text-black'
          }`}>
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className={`text-[10px] font-mono tracking-widest uppercase ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                {officerInfo.badge}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h1 className={`text-xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>
              {officerInfo.officerName}
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className={`p-2.5 rounded-full border ${
            isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-zinc-100 border-zinc-300 text-black'
          }`}>
            <Bell className="w-4 h-4" />
          </button>
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>
      </div>

      <div className="px-6 space-y-6 mt-3">
        {/* Officer Verified Session Profile Sub-card */}
        <div 
          onClick={onNavigateProfile}
          className={`cursor-pointer p-3 rounded-2xl border flex items-center justify-between text-xs font-mono transition-all hover:border-emerald-500/50 ${
            isDark ? 'bg-zinc-950/80 border-zinc-850 text-zinc-400' : 'bg-zinc-50 border-zinc-200 text-zinc-600'
          }`}
        >
          <div className="flex items-center space-x-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>ID: <strong className="text-white">{officerInfo.officerId}</strong></span>
          </div>
          <span className="text-zinc-500 font-semibold flex items-center space-x-1">
            <span>{officerInfo.mobile}</span>
            <span className="text-emerald-400">→</span>
          </span>
        </div>

        {/* Officer Live Metrics Banner (Clickable Statistic Cards) */}
        <div className={`p-5 rounded-3xl border ${
          isDark 
            ? 'bg-zinc-950 border-zinc-800 shadow-[0_4px_20px_rgba(0,0,0,0.8)]' 
            : 'bg-zinc-50 border-zinc-200 shadow-sm'
        }`}>
          <div className="grid grid-cols-2 gap-4">
            <div 
              onClick={() => setIsHistoryModalOpen(true)}
              className="space-y-1 cursor-pointer p-2 rounded-xl transition-all hover:bg-zinc-900/50"
              title="Click to view all inspection history"
            >
              <span className={`text-[10px] font-mono tracking-widest uppercase ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                INSPECTIONS
              </span>
              <p className="text-2xl font-extrabold tracking-tight">
                {loadingStats ? <span className="animate-pulse text-zinc-600">...</span> : totalInspections}
              </p>
            </div>

            <div 
              onClick={() => setIsNonCompliantModalOpen(true)}
              className="space-y-1 cursor-pointer p-2 rounded-xl transition-all hover:bg-zinc-900/50"
              title="Click to view non-compliant violations"
            >
              <span className={`text-[10px] font-mono tracking-widest uppercase ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                VIOLATIONS
              </span>
              <p className="text-2xl font-extrabold tracking-tight text-red-500">
                {loadingStats ? <span className="animate-pulse text-zinc-600">...</span> : totalViolations}
              </p>
            </div>

            <div 
              onClick={() => setIsHistoryModalOpen(true)}
              className="space-y-1 pt-2 border-t border-zinc-800/40 cursor-pointer p-2 rounded-xl transition-all hover:bg-zinc-900/50"
              title="Click to view today's inspections"
            >
              <span className={`text-[10px] font-mono tracking-widest uppercase ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                TODAY
              </span>
              <p className="text-xl font-bold">
                {loadingStats ? <span className="animate-pulse text-zinc-600">...</span> : todayInspections}
              </p>
            </div>

            <div 
              onClick={() => setIsNonCompliantModalOpen(true)}
              className="space-y-1 pt-2 border-t border-zinc-800/40 cursor-pointer p-2 rounded-xl transition-all hover:bg-zinc-900/50"
              title="Click to view pending reviews"
            >
              <span className={`text-[10px] font-mono tracking-widest uppercase ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                PENDING
              </span>
              <p className="text-xl font-bold text-amber-500">
                {loadingStats ? <span className="animate-pulse text-zinc-600">...</span> : pendingInspections}
              </p>
            </div>
          </div>
        </div>

        {/* Start Inspection Banner */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={onStartScan}
          className={`w-full py-4 px-6 rounded-2xl border flex items-center justify-between transition-all ${
            isDark 
              ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]' 
              : 'bg-black text-white border-black shadow-md'
          }`}
        >
          <div className="flex items-center space-x-3">
            <PlusCircle className="w-5 h-5" />
            <span className="font-extrabold text-sm tracking-wider uppercase">START NEW INSPECTION</span>
          </div>
          <ArrowRight className="w-5 h-5" />
        </motion.button>

        {/* 6 Officer Grid Cards (100% Functional Buttons) */}
        <div className="grid grid-cols-2 gap-3">
          {actionCards.map((card) => {
            const Icon = card.icon;
            return (
              <motion.button
                key={card.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={card.action}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between space-y-3 transition-all ${
                  isDark 
                    ? 'bg-zinc-950 border-zinc-800 hover:border-zinc-700' 
                    : 'bg-zinc-100 border-zinc-300 hover:border-zinc-400'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                  isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-300 text-black'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold leading-snug">{card.title}</h3>
                  <p className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>{card.subtitle}</p>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Recent Officer Audit Logs */}
        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center">
            <h3 className={`text-xs font-mono uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Recent Audit Stream
            </h3>
            <button
              onClick={() => setIsHistoryModalOpen(true)}
              className={`text-xs font-semibold hover:underline ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}
            >
              Full Log
            </button>
          </div>

          <div className="space-y-2.5">
            {inspections.length > 0 ? (
              inspections.map((insp) => (
                <div
                  key={insp.id}
                  onClick={() => onViewReport(insp.id)}
                  className={`cursor-pointer p-4 rounded-2xl border flex items-center justify-between transition-all ${
                    isDark ? 'bg-zinc-950 border-zinc-850 hover:border-zinc-700' : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                        {insp.id}
                      </span>
                      <h4 className="text-xs font-bold">{insp.productName}</h4>
                    </div>
                    <p className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>
                      {insp.timestamp ? formatISTDateTime(insp.timestamp, ' • ') : `${insp.date} • ${insp.time}`}
                    </p>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                    insp.status === 'compliant'
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                      : 'bg-red-500/10 text-red-500 border-red-500/30'
                  }`}>
                    {insp.status === 'compliant' ? '✓ Clear' : '⚠ Non-Compliant'}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs font-mono text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
                No inspections found.
              </div>
            )}
          </div>
        </div>

        <ComplaintQueue officerSession={officerSession} theme={theme} />
      </div>

      {/* 3 Interactive Modals for Officer Dashboard */}
      <RuleManagementModal
        isOpen={isRuleModalOpen}
        onClose={() => setIsRuleModalOpen(false)}
        theme={theme}
      />

      <InspectionHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        onViewReport={onViewReport}
        inspections={inspections}
        theme={theme}
      />

      <ReportGeneratorModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        inspection={inspections[0]}
        theme={theme}
      />

      <NonCompliantModal
        isOpen={isNonCompliantModalOpen}
        onClose={() => setIsNonCompliantModalOpen(false)}
        onViewReport={onViewReport}
        inspections={inspections}
        theme={theme}
      />

      {/* Bottom Navigation */}
      <BottomNav 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'inspections') setIsHistoryModalOpen(true);
          if (tab === 'reports') setIsReportModalOpen(true);
          if (tab === 'profile' && onNavigateProfile) onNavigateProfile();
        }} 
        role="officer" 
        theme={theme} 
      />
    </div>
  );
}
