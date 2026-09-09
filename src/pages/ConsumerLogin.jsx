import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function ConsumerLogin({ onBack, onLoginSuccess, onNavigateSignUp, theme, toggleTheme }) {
  const isDark = theme === 'dark';
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);
    const result = await onLoginSuccess(mobile, password);
    setLoading(false);
    if (!result?.success) setErrorMessage(result?.error || 'Invalid login credentials.');
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between p-6 transition-colors duration-300 ${
      isDark ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      {/* Header Bar */}
      <div className="w-full flex justify-between items-center pt-2">
        <button
          onClick={onBack}
          className={`p-2 rounded-full border transition-colors ${
            isDark ? 'border-zinc-800 bg-zinc-950 text-white hover:bg-zinc-900' : 'border-zinc-300 bg-zinc-100 text-black hover:bg-zinc-200'
          }`}
          aria-label="Go Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </div>

      {/* Main Login Form Container */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm mx-auto my-auto space-y-6"
      >
        <div className="space-y-1">
          <h1 className={`text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>
            Consumer Login
          </h1>
          <p className={`text-xs font-mono tracking-wide ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Check your products. Know your rights.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && <p className="text-xs text-red-400 font-semibold">{errorMessage}</p>}
          {/* Mobile Field */}
          <div className="space-y-1.5">
            <label className={`block text-xs font-medium uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Mobile Number / Email
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
                className="w-full bg-transparent px-3 py-3.5 text-sm focus:outline-none placeholder:text-zinc-600 font-mono"
              />
            </div>
          </div>

          {/* Password Field */}
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

          {/* Remember me & Forgot password */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900 text-white focus:ring-0"
              />
              <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>Remember me</span>
            </label>
            <button 
              type="button" 
              onClick={() => alert("Password reset link has been dispatched to your registered email.")}
              className={`font-medium hover:underline ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all shadow-md mt-2 ${
              isDark 
                ? 'bg-white text-black hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
                : 'bg-black text-white hover:bg-zinc-800 shadow-[0_4px_12px_rgba(0,0,0,0.2)]'
            }`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </motion.button>
        </form>

      </motion.div>

      {/* Footer Nav Link to Sign Up */}
      <div className="text-center pb-4 text-xs font-mono">
        <span className={isDark ? 'text-zinc-500' : 'text-zinc-400'}>
          Don't have an account?{' '}
        </span>
        <button 
          onClick={onNavigateSignUp}
          className={`font-semibold hover:underline ${isDark ? 'text-white' : 'text-black'}`}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
