/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        grim: {
          void: '#05000a', // Corrected to target UI
          panel: '#090518',
          cyan: '#00F0FF',
          purple: '#B026FF',
          pink: '#FF0055',
          yellow: '#FFD600',
          alert: '#FF2A6D',
          'text-main': '#E0E6ED',
          'text-muted': '#94A3B8',
          accent: '#00F0FF',
        }
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'width-expand': 'width-expand 0.3s ease-out forwards',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #00F0FF, 0 0 10px #00F0FF' },
          '100%': { boxShadow: '0 0 10px #00F0FF, 0 0 20px #00F0FF, 0 0 30px #00F0FF' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'width-expand': {
          '0%': { width: '0%', left: '50%' },
          '100%': { width: '100%', left: '0%' },
        },
      }
    },
  },
  plugins: [],
}
