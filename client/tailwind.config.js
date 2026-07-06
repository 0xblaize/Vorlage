/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass-sm': '0 2px 10px rgba(0, 0, 0, 0.05)',
        'glass-md': '0 8px 30px rgba(0, 0, 0, 0.12)',
        'glass-lg': '0 20px 40px rgba(0, 0, 0, 0.2)',
        'glass-inset': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
        'glass-inset-light': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.5)',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        }
      }
    },
  },
  plugins: [],
}
