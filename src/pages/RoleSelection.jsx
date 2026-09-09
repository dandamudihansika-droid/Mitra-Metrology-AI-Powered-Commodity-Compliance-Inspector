import React from 'react';
import { motion } from 'framer-motion';
import { User, ShieldCheck, ArrowRight } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function RoleSelection({ role, setRole, onProceed, theme, toggleTheme }) {
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col justify-between items-center p-6 transition-colors duration-300 ${
      isDark ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      {/* Top Bar Theme Toggle */}
      <div className="w-full flex justify-between items-center pt-2 z-10">
        <span className={`text-xs tracking-widest font-mono uppercase ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
          MITRA METROLOGY
        </span>
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </div>

      {/* Main Content */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm flex flex-col items-center text-center my-auto space-y-8 z-10"
      >
        <div className="space-y-2">
          <h2 className={`text-2xl font-light tracking-tight ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Welcome to
          </h2>
          <h1 className={`text-4xl font-extrabold tracking-widest font-sans ${isDark ? 'text-white' : 'text-black'}`}>
            LMPC
          </h1>
          <p className={`text-xs font-mono tracking-wide ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Choose your role to continue
          </p>
        </div>

        {/* Segmented Pill Selector (Monochrome) */}
        <div className={`relative w-full p-1.5 rounded-full border flex items-center ${
          isDark 
            ? 'bg-zinc-950 border-zinc-800 shadow-inner' 
            : 'bg-zinc-100 border-zinc-300 shadow-sm'
        }`}>
          {/* Active Sliding Background Pill */}
          <motion.div
            layout
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-0.375rem)] rounded-full ${
              role === 'consumer'
                ? 'left-1.5'
                : 'left-[calc(50%+0.1875rem)]'
            } ${
              isDark 
                ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                : 'bg-black text-white shadow-[0_4px_10px_rgba(0,0,0,0.25)]'
            }`}
          />

          {/* Consumer Tab Button */}
          <button
            onClick={() => setRole('consumer')}
            className={`relative z-10 w-1/2 py-3 flex items-center justify-center space-x-2 text-sm font-semibold rounded-full transition-colors ${
              role === 'consumer'
                ? isDark ? 'text-black' : 'text-white'
                : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Consumer</span>
          </button>

          {/* Officer Tab Button */}
          <button
            onClick={() => setRole('officer')}
            className={`relative z-10 w-1/2 py-3 flex items-center justify-center space-x-2 text-sm font-semibold rounded-full transition-colors ${
              role === 'officer'
                ? isDark ? 'text-black' : 'text-white'
                : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Officer</span>
          </button>
        </div>

        {/* Dynamic Description Pill */}
        <p className={`text-xs font-mono tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
          {role === 'consumer' ? 'Scan. Verify. Stay Informed.' : 'Conduct Inspections & Enforce Compliance'}
        </p>
      </motion.div>

      {/* Footer Action */}
      <div className="w-full flex justify-center pb-8 z-10">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onProceed}
          className={`flex items-center justify-center w-14 h-14 rounded-full border transition-all duration-300 ${
            isDark 
              ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.4)]' 
              : 'bg-black text-white border-black shadow-[0_4px_15px_rgba(0,0,0,0.3)]'
          }`}
        >
          <ArrowRight className="w-6 h-6" />
        </motion.button>
      </div>
    </div>
  );
}
