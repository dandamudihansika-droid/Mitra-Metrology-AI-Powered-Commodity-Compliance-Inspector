import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import LmpcLogo from '../components/LmpcLogo';
import ThemeToggle from '../components/ThemeToggle';

export default function SplashScreen({ onStart, theme, toggleTheme }) {
  const isDark = theme === 'dark';

  return (
    <div className={`relative min-h-screen flex flex-col justify-between items-center p-6 overflow-hidden transition-colors duration-300 ${
      isDark ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      {/* Header Theme Toggle */}
      <div className="w-full flex justify-end items-center pt-2 z-20">
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </div>

      {/* Decorative Wave Overlay Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <svg className="w-full h-full" viewBox="0 0 400 800" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M-100 400 C 100 300, 300 500, 500 400" stroke={isDark ? "white" : "black"} strokeWidth="1" strokeDasharray="4 4" />
          <path d="M-100 480 C 100 380, 300 580, 500 480" stroke={isDark ? "white" : "black"} strokeWidth="0.75" />
          <circle cx="200" cy="400" r="180" stroke={isDark ? "white" : "black"} strokeWidth="0.5" strokeOpacity="0.2" />
        </svg>
      </div>

      {/* Center Content: 3D Logo & Branding */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center justify-center text-center my-auto z-10 space-y-6"
      >
        <LmpcLogo size="large" glow={true} isDark={isDark} />
      </motion.div>

      {/* Footer Tagline & Start Action */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-full flex flex-col items-center z-10 pb-8 space-y-6"
      >
        <div className="text-center space-y-1">
          <p className={`text-xs font-mono tracking-[0.25em] uppercase ${
            isDark ? 'text-zinc-400' : 'text-zinc-600'
          }`}>
            A Safer Market
          </p>
          <p className={`text-xs font-mono tracking-[0.25em] uppercase font-bold ${
            isDark ? 'text-zinc-200' : 'text-zinc-800'
          }`}>
            A Stronger India
          </p>
        </div>

        {/* Circular Glowing Start Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className={`group relative flex items-center justify-center w-14 h-14 rounded-full border transition-all duration-300 ${
            isDark 
              ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:shadow-[0_0_30px_rgba(255,255,255,0.6)]' 
              : 'bg-black text-white border-black shadow-[0_4px_15px_rgba(0,0,0,0.3)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.5)]'
          }`}
          aria-label="Start Application"
        >
          <ArrowRight className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-0.5" />
        </motion.button>
      </motion.div>
    </div>
  );
}
