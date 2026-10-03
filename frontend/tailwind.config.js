/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        network: {
          bg: '#050505',
          panel: '#0B0B0B',
          panelHover: '#111111',
          border: '#222222',
          borderHover: '#333333',
          gold: '#D4AF37',
          'gold-light': '#F3D77A',
          'gold-dark': '#8F6F1B',
          text: '#F5F5F5',
          muted: '#888888',
          subtle: '#444444',
          online: '#10B981',
          offline: '#6B7280',
          warning: '#F59E0B',
          danger: '#EF4444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'panel': '0 2px 8px 0 rgba(0, 0, 0, 0.4)',
        'glow-gold-sm': '0 0 10px 0 rgba(212, 175, 55, 0.15)',
        'glow-emerald-sm': '0 0 10px 0 rgba(16, 185, 129, 0.2)',
      }
    },
  },
  plugins: [],
}
