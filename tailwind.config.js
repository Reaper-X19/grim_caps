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
          dark: '#0a0a0a',
          darker: '#050505',
          accent: '#00ffcc',
          purple: '#9333ea',
          blue: '#3b82f6',
          gray: {
            800: '#1f1f1f',
            700: '#2a2a2a',
            600: '#3a3a3a',
          }
        }
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #00ffcc, 0 0 10px #00ffcc' },
          '100%': { boxShadow: '0 0 10px #00ffcc, 0 0 20px #00ffcc, 0 0 30px #00ffcc' },
        }
      }
    },
  },
  plugins: [],
}
