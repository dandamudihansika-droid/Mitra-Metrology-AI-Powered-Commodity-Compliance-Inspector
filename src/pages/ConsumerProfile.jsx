import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Mail, Phone, LogOut, ShieldCheck } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function ConsumerProfile({
  userSession,
  onBack,
  onLogout,
  theme,
  toggleTheme
}) {
  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen pb-24 transition-colors duration-300 ${
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

        <h1 className="text-lg font-bold">Profile</h1>

        <ThemeToggle
          theme={theme}
          toggleTheme={toggleTheme}
        />
      </div>

      {/* Profile */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 space-y-6"
      >
        {/* Avatar */}
        <div className="flex flex-col items-center pt-4">
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center border ${
              isDark
                ? 'bg-zinc-900 border-zinc-700'
                : 'bg-zinc-100 border-zinc-300'
            }`}
          >
            <User className="w-10 h-10" />
          </div>

          <h2 className="text-xl font-bold mt-4">
            {userSession?.name || 'Consumer'}
          </h2>

          <p
            className={`text-xs mt-1 ${
              isDark ? 'text-zinc-500' : 'text-zinc-500'
            }`}
          >
            Consumer Account
          </p>
        </div>

        {/* Account Information */}
        <div className="space-y-3">
          <h3
            className={`text-xs font-mono uppercase tracking-wider ${
              isDark ? 'text-zinc-500' : 'text-zinc-500'
            }`}
          >
            Account Information
          </h3>

          <div
            className={`rounded-2xl border divide-y ${
              isDark
                ? 'bg-zinc-950 border-zinc-800 divide-zinc-800'
                : 'bg-zinc-50 border-zinc-200 divide-zinc-200'
            }`}
          >
            <div className="flex items-center gap-3 p-4">
              <User className="w-5 h-5 text-zinc-500" />
              <div>
                <p className="text-[10px] text-zinc-500 uppercase">
                  Name
                </p>
                <p className="text-sm font-semibold">
                  {userSession?.name || 'Not available'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4">
              <Mail className="w-5 h-5 text-zinc-500" />
              <div>
                <p className="text-[10px] text-zinc-500 uppercase">
                  Email
                </p>
                <p className="text-sm font-semibold">
                  {userSession?.email || 'Not provided'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4">
              <Phone className="w-5 h-5 text-zinc-500" />
              <div>
                <p className="text-[10px] text-zinc-500 uppercase">
                  Mobile
                </p>
                <p className="text-sm font-semibold">
                  {userSession?.phone ||
                    userSession?.mobile ||
                    'Not provided'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Verification */}
        <div
          className={`rounded-2xl border p-4 flex items-center gap-3 ${
            isDark
              ? 'bg-zinc-950 border-zinc-800'
              : 'bg-zinc-50 border-zinc-200'
          }`}
        >
          <ShieldCheck className="w-6 h-6 text-emerald-500" />

          <div>
            <p className="text-sm font-bold">
              Account Active
            </p>
            <p className="text-xs text-zinc-500">
              Your consumer account is ready to use.
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full py-3.5 rounded-xl border border-red-500/30 text-red-500 font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-500/10"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </motion.div>
    </div>
  );
}