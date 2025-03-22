/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // or 'media'
  theme: {
    extend: {
      colors: {
        orion: {
          lightBg: '#F0F5F9',
          darkGray: '#1E2022',
          mediumGray: '#34373B',
          lightGray: '#F0F5F9',
          gray: '#788189',
        }
      },
      fontFamily: {
        quicksand: ['Quicksand', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'glow': '0 0 15px rgba(255, 255, 255, 0.5)',
      },
    },
  },
  plugins: [],
}
