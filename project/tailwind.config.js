/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          dark: '#0f1420',
          light: '#151d30'
        },
        neon: {
          blue: '#4361ee',
          purple: '#7209b7',
          pink: '#f72585',
          teal: '#4cc9f0'
        },
        success: {
          DEFAULT: '#10b981',
          dark: '#059669'
        },
        warning: {
          DEFAULT: '#f59e0b',
          dark: '#d97706'
        },
        error: {
          DEFAULT: '#ef4444',
          dark: '#dc2626'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif']
      },
      animation: {
        'neon-pulse': 'neon-pulse 2s infinite ease-in-out',
        'float': 'float 6s infinite ease-in-out',
      },
      keyframes: {
        'neon-pulse': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(67, 97, 238, 0.5), 0 0 10px rgba(67, 97, 238, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(67, 97, 238, 0.8), 0 0 30px rgba(67, 97, 238, 0.5)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};