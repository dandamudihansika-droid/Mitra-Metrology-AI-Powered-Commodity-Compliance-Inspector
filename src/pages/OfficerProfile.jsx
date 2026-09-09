import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, UserCheck, Shield, Phone, MapPin, BadgeCheck, LogOut, Lock, Calendar } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import { formatISTDateTime } from '../utils/dateUtils';

export default function OfficerProfile({ officerSession, onBack, onLogout, theme, toggleTheme }) {
  const isDark = theme === 'dark';

  const profileData = officerSession || {
    officerId: "INSP-2026-AP0231",
    officerName: "Inspector A. Sharma",
    mobile: "+91 93982 08123",
    zone: "South Zone - Circle 4",
    badge: "VERIFIED LMPC AUDITOR",
    authenticatedAt: new Date().toISOString()
  };

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
        <span className="text-sm font-bold tracking-tight">Inspector Profile</span>
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm mx-auto my-auto space-y-5"
      >
        {/* Profile Banner */}
        <div className={`p-6 rounded-3xl border text-center space-y-3 relative overflow-hidden ${
          isDark 
            ? 'bg-zinc-950 border-zinc-800 shadow-[0_4px_25px_rgba(0,0,0,0.8)]' 
            : 'bg-zinc-50 border-zinc-200 shadow-md'
        }`}>
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center">
            <UserCheck className="w-10 h-10 text-emerald-400" />
          </div>

          <div>
            <div className="inline-flex items-center space-x-1 px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-400 mb-1">
              <BadgeCheck className="w-3 h-3" />
              <span>{profileData.badge}</span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">{profileData.officerName}</h2>
            <p className="text-xs font-mono text-zinc-500">ID: {profileData.officerId}</p>
          </div>
        </div>

        {/* Profile Details List */}
        <div className={`p-4 rounded-2xl border text-xs space-y-3 font-mono ${
          isDark ? 'bg-zinc-950 border-zinc-850' : 'bg-white border-zinc-200'
        }`}>
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/40">
            <span className="text-zinc-500 flex items-center space-x-2">
              <Phone className="w-3.5 h-3.5 text-zinc-400" />
              <span>Mobile:</span>
            </span>
            <span className="font-bold text-white">{profileData.mobile}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/40">
            <span className="text-zinc-500 flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
              <span>Assigned Zone:</span>
            </span>
            <span className="font-semibold text-right text-zinc-300 max-w-[160px]">{profileData.zone}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/40">
            <span className="text-zinc-500 flex items-center space-x-2">
              <Shield className="w-3.5 h-3.5 text-zinc-400" />
              <span>Department:</span>
            </span>
            <span className="font-semibold text-zinc-300">Legal Metrology Dept.</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-zinc-500 flex items-center space-x-2">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span>Authenticated At:</span>
            </span>
            <span className="text-[11px] text-emerald-400">
              {formatISTDateTime(profileData.authenticatedAt || new Date())}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Logout Action */}
      <div className="w-full max-w-sm mx-auto pt-4">
        <button
          onClick={onLogout}
          className={`w-full py-3.5 rounded-2xl border font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
            isDark 
              ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20' 
              : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
          }`}
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out / Switch Role</span>
        </button>
      </div>
    </div>
  );
}
