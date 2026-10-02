/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#080c14',
          card: '#0e1626',
          panel: '#131e33',
          border: '#1f2e4d',
          green: '#10b981',
          'green-bright': '#00ff66',
          cyan: '#06b6d4',
          'cyan-bright': '#00f2fe',
          red: '#ef4444',
          amber: '#f59e0b',
          muted: '#64748b',
          text: '#e2e8f0',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Consolas', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-green': '0 0 15px -3px rgba(16, 185, 129, 0.3)',
        'glow-cyan': '0 0 15px -3px rgba(6, 182, 212, 0.3)',
        'glow-red': '0 0 15px -3px rgba(239, 68, 68, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        }
      }
    },
  },
  plugins: [],
}
