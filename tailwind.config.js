/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#000000',
          card: '#0B0B0E',
          cardSubtle: '#121216',
          border: '#222228',
          borderLight: '#33333E',
        },
        light: {
          bg: '#FFFFFF',
          card: '#F4F4F6',
          cardSubtle: '#E8E8EC',
          border: '#E4E4E7',
          borderDark: '#D4D4D8',
        },
        mitra: {
          accent: '#FFFFFF',
          accentDark: '#000000',
          violation: '#EF4444',
          violationBg: 'rgba(239, 68, 68, 0.1)',
          compliant: '#10B981',
          compliantBg: 'rgba(16, 185, 129, 0.1)',
          warning: '#F59E0B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'glow-white': '0 0 25px rgba(255, 255, 255, 0.25)',
        'glow-white-sm': '0 0 12px rgba(255, 255, 255, 0.18)',
        'glow-white-lg': '0 0 45px rgba(255, 255, 255, 0.35)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.3)',
        'glow-green': '0 0 20px rgba(16, 185, 129, 0.3)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan-line': 'scan 2.5s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        scan: {
          '0%': { top: '5%' },
          '100%': { top: '90%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
