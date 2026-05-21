/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ai: {
          bg:     '#05050A',       // Very deep dark, almost black
          card:   'rgba(20, 20, 30, 0.65)',
          border: 'rgba(255, 255, 255, 0.06)',
          indigo: '#6366f1',
          violet: '#8b5cf6',
          fuchsia:'#d946ef',
          cyan:   '#06b6d4',
          emerald:'#10b981',
          slate:  '#94a3b8'
        },
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", 'sans-serif'],
        display: ["'Outfit'", 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow':  'spin 3s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-ai': 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
        'gradient-ai-text': 'linear-gradient(to right, #8b5cf6, #d946ef)',
      },
    },
  },
  plugins: [],
}