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
          void: '#030014', // Ultra deep purple-black
          panel: '#090518', // Slightly lighter void
          cyan: '#00F0FF', // Cyberpunk Blue
          purple: '#B026FF', // Neon Purple
          pink: '#FF0055', // Aggressive Pink
          yellow: '#FFD600', // Cyber Yellow
          alert: '#FF2A6D', // Glitch Red
          'text-main': '#E0E6ED',
          'text-muted': '#94A3B8',
          // Keep existing distinct colors for logic if needed
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
          '0%': { boxShadow: '0 0 5px #00ffcc, 0 0 10px #00ffcc' },
          '100%': { boxShadow: '0 0 10px #00ffcc, 0 0 20px #00ffcc, 0 0 30px #00ffcc' },
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
