import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Phone, Lock, Eye, EyeOff, ShieldCheck, Mail } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function ConsumerSignUp({ onBack, onSignUpSuccess, onNavigateLogin, theme, toggleTheme }) {
  const isDark = theme === 'dark';
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || (!mobile && !email) || !password) {
      setErrorMsg('Please provide your name, email or phone, and password.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      setErrorMsg('You must agree to the Terms & Conditions.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    const result = await onSignUpSuccess({ name: fullName, email, phone: mobile, password, confirmPassword });
    setLoading(false);
    if (!result?.success) setErrorMsg(result?.error || 'Unable to create account.');
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between p-6 transition-colors duration-300 ${
      isDark ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      {/* Top Header */}
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

      {/* Main Registration Form */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm mx-auto my-auto space-y-6"
      >
        <div className="space-y-1">
          <h1 className={`text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>
            Create Account
          </h1>
          <p className={`text-xs font-mono tracking-wide ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Join Mitra Metrology for transparent commodity compliance.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-left">
          {/* Full Name */}
          <div className="space-y-1">
            <label className={`block text-[11px] font-mono uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Full Name *
            </label>
            <div className={`relative flex items-center rounded-xl border transition-all ${
              isDark ? 'bg-zinc-950 border-zinc-800 text-white focus-within:border-white' : 'bg-zinc-100 border-zinc-300 text-black focus-within:border-black'
            }`}>
              <User className={`w-4 h-4 ml-3.5 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ananya Sharma"
                className="w-full bg-transparent px-3 py-3 text-sm focus:outline-none placeholder:text-zinc-600 font-sans"
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div className="space-y-1">
            <label className={`block text-[11px] font-mono uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Mobile Number *
            </label>
            <div className={`relative flex items-center rounded-xl border transition-all ${
              isDark ? 'bg-zinc-950 border-zinc-800 text-white focus-within:border-white' : 'bg-zinc-100 border-zinc-300 text-black focus-within:border-black'
            }`}>
              <Phone className={`w-4 h-4 ml-3.5 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />
              <input
                type="text"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-transparent px-3 py-3 text-sm focus:outline-none placeholder:text-zinc-600 font-mono"
              />
            </div>
          </div>

          {/* Optional Email */}
          <div className="space-y-1">
            <label className={`block text-[11px] font-mono uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Email Address (Optional)
            </label>
            <div className={`relative flex items-center rounded-xl border transition-all ${
              isDark ? 'bg-zinc-950 border-zinc-800 text-white focus-within:border-white' : 'bg-zinc-100 border-zinc-300 text-black focus-within:border-black'
            }`}>
              <Mail className={`w-4 h-4 ml-3.5 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ananya@example.com"
                className="w-full bg-transparent px-3 py-3 text-sm focus:outline-none placeholder:text-zinc-600 font-sans"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className={`block text-[11px] font-mono uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Password *
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
                className="w-full bg-transparent px-3 py-3 text-sm focus:outline-none placeholder:text-zinc-600"
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

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className={`block text-[11px] font-mono uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Confirm Password *
            </label>
            <div className={`relative flex items-center rounded-xl border transition-all ${
              isDark ? 'bg-zinc-950 border-zinc-800 text-white focus-within:border-white' : 'bg-zinc-100 border-zinc-300 text-black focus-within:border-black'
            }`}>
              <Lock className={`w-4 h-4 ml-3.5 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-transparent px-3 py-3 text-sm focus:outline-none placeholder:text-zinc-600"
              />
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="pt-1">
            <label className="flex items-start space-x-2.5 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded border-zinc-700 bg-zinc-900 text-white focus:ring-0"
              />
              <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>
                I agree to the <span className="underline">Terms of Service</span> & <span className="underline">Legal Metrology Guidelines</span>.
              </span>
            </label>
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
            <span>{loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}</span>
          </motion.button>
        </form>
      </motion.div>

      {/* Footer Nav Link */}
      <div className="text-center pb-4 text-xs font-mono">
        <span className={isDark ? 'text-zinc-500' : 'text-zinc-400'}>
          Already have an account?{' '}
        </span>
        <button 
          onClick={onNavigateLogin}
          className={`font-semibold hover:underline ${isDark ? 'text-white' : 'text-black'}`}
        >
          Log In
        </button>
      </div>
    </div>
  );
}
