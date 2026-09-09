import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, Lock, Eye, EyeOff, BadgeCheck, Mail, Copy } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function OfficerLogin({ onBack, onLoginSubmit, onNavigateSignUp, theme, toggleTheme }) {
  const isDark = theme === 'dark';
  const [identifier, setIdentifier] = useState('OFFICER001');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);
    const result = await onLoginSubmit(identifier, password);
    setLoading(false);
    if (!result?.success) setErrorMessage(result?.error || 'Unable to request verification code.');
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between p-6 transition-colors duration-300 ${
      isDark ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      {/* Header */}
      <div className="w-full flex justify-between items-center pt-2">
        <button
          onClick={onBack}
          className={`p-2 rounded-full border transition-colors ${
            isDark ? 'border-zinc-800 bg-zinc-950 text-white hover:bg-zinc-900' : 'border-zinc-300 bg-zinc-100 text-black hover:bg-zinc-200'
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </div>

      {/* Main Security Form */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm mx-auto my-auto space-y-6 text-center"
      >
        {/* Shield Emblem */}
        <div className="flex justify-center mb-2">
          <div className={`p-4 rounded-2xl border ${
            isDark 
              ? 'bg-zinc-950 border-zinc-800 text-white shadow-[0_0_20px_rgba(255,255,255,0.15)]' 
              : 'bg-zinc-100 border-zinc-300 text-black shadow-sm'
          }`}>
            <ShieldCheck className="w-10 h-10" />
          </div>

          {errorMessage && <p className="text-xs text-red-400 font-semibold">{errorMessage}</p>}
        </div>

        <div className="space-y-1">
          <h1 className={`text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>
            Officer Portal
          </h1>
          <p className={`text-xs font-mono tracking-widest uppercase ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Authorized Personnel Only
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Officer ID or Email */}
          <div className="space-y-1.5">
            <label className={`block text-xs font-medium uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Officer ID or Registered Email
            </label>
            <div className={`relative flex items-center rounded-xl border transition-all ${
              isDark ? 'bg-zinc-950 border-zinc-800 text-white focus-within:border-white' : 'bg-zinc-100 border-zinc-300 text-black focus-within:border-black'
            }`}>
              <Mail className={`w-4 h-4 ml-3.5 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="OFFICER001 or officer@example.com"
                className="w-full bg-transparent px-3 py-3.5 text-sm focus:outline-none placeholder:text-zinc-600"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className={`block text-xs font-medium uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Password
            </label>
            <div className={`relative flex items-center rounded-xl border transition-all ${
              isDark ? 'bg-zinc-950 border-zinc-800 text-white focus-within:border-white' : 'bg-zinc-100 border-zinc-300 text-black focus-within:border-black'
            }`}>
              <Lock className={`w-4 h-4 ml-3.5 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-transparent px-3 py-3.5 text-sm focus:outline-none placeholder:text-zinc-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="mr-3 text-zinc-500 hover:text-zinc-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Action */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            className={`w-full py-3.5 rounded-xl font-bold text-xs tracking-wider transition-all shadow-md mt-2 flex items-center justify-center space-x-2 ${
              isDark 
                ? 'bg-white text-black hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.25)]' 
                : 'bg-black text-white hover:bg-zinc-800 shadow-md'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{loading ? 'LOGGING IN...' : 'LOGIN'}</span>
          </motion.button>
        </form>

        <div className={`p-4 rounded-xl border text-xs space-y-2 ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-100 border-zinc-300'}`}>
          <p className="font-bold tracking-widest uppercase">Demo Credentials</p>
          <p>Officer ID: <strong>OFFICER001</strong></p>
          <p>Email: <strong>officer.demo@mitrametrology.com</strong></p>
          <p>Password: <strong>Officer@123</strong></p>
          <button type="button" onClick={() => { setIdentifier('OFFICER001'); setPassword('Officer@123'); }} className="flex items-center gap-2 text-emerald-400 font-semibold">
            <Copy className="w-3.5 h-3.5" /> Use Demo Credentials
          </button>
        </div>
        <button type="button" onClick={onNavigateSignUp} className="w-full text-xs font-semibold underline">Create Officer Account</button>
      </motion.div>

      {/* Footer */}
      <div className="text-center pb-4 text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
        GOVERNMENT OF INDIA LEGAL METROLOGY DEPT
      </div>
    </div>
  );
}
