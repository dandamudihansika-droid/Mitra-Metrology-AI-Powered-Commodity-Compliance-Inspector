import React from 'react';
import { motion } from 'framer-motion';

export default function ThemeToggle({ theme, toggleTheme }) {
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label="Toggle Dark and Light Mode"
      className={`relative flex items-center justify-between w-16 h-8 px-1.5 rounded-full border transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-white/50 ${
        isDark 
          ? 'bg-zinc-950 border-zinc-800 text-zinc-400 shadow-inner' 
          : 'bg-zinc-100 border-zinc-300 text-zinc-600 shadow-sm'
      }`}
    >
      {/* Icons */}
      <span className={`text-xs font-semibold z-10 transition-colors ${isDark ? 'text-white' : 'text-zinc-400'}`}>
        ☾
      </span>
      <span className="text-[10px] font-bold z-10 opacity-30 select-none">
        ◉
      </span>
      <span className={`text-xs font-semibold z-10 transition-colors ${!isDark ? 'text-black' : 'text-zinc-500'}`}>
        ☀
      </span>

      {/* Sliding Pill Indicator */}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`absolute top-1 bottom-1 w-6 rounded-full ${
          isDark 
            ? 'left-1 bg-white shadow-[0_0_10px_rgba(255,255,255,0.4)]' 
            : 'right-1 bg-black shadow-[0_0_10px_rgba(0,0,0,0.25)]'
        }`}
      />
    </button>
  );
}
