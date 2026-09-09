import React from 'react';
import { motion } from 'framer-motion';

export default function LmpcLogo({ size = 'large', glow = true, isDark = true }) {
  const isLarge = size === 'large';
  const isSmall = size === 'small';

  return (
    <div className={`relative flex flex-col items-center justify-center text-center select-none ${isLarge ? 'py-2' : 'py-1'}`}>
      {/* Background Soft Ambient Glow */}
      {glow && (
        <div 
          className={`absolute rounded-full blur-3xl transition-opacity duration-500 pointer-events-none ${
            isDark 
              ? 'bg-white/20 opacity-70' 
              : 'bg-black/10 opacity-50'
          } ${isLarge ? 'w-56 h-56' : 'w-24 h-24'}`}
        />
      )}

      {/* Official 3D LMPC Logo Image Container */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className={`relative flex items-center justify-center ${
          isLarge ? 'w-64 h-64' : isSmall ? 'w-16 h-16' : 'w-36 h-36'
        }`}>
          <img
            src="/lmpc_logo.jpg"
            alt="LMPC Logo"
            className={`w-full h-full object-contain filter transition-all duration-300 ${
              isDark 
                ? 'drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]' 
                : 'invert drop-shadow-[0_4px_15px_rgba(0,0,0,0.3)]'
            }`}
          />
        </div>
      </motion.div>
    </div>
  );
}
