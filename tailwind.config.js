/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg:     '#030712',
          card:   'rgba(3,7,18,0.85)',
          border: 'rgba(255,255,255,0.08)',
          green:  '#00d4aa',
          blue:   '#3b82f6',
          purple: '#a78bfa',
        },
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "'Fira Code'", 'monospace'],
        display: ["'Syne'", "'Orbitron'", 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow':  'spin 3s linear infinite',
      },
      backgroundImage: {
        'grid-cyber': `
          linear-gradient(rgba(0,212,170,0.07) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,212,170,0.07) 1px, transparent 1px)
        `,
      },
      backgroundSize: {
        'grid': '60px 60px',
      },
    },
  },
  plugins: [],
}