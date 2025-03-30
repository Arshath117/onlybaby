/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sour: ["Sour Gummy", 'sans-serif'],
        happy: ["Happy Monkey", 'cursive'],
        happy: ["Happy Monkey", 'serif'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        vibrate: {
          '0%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-2px)' },
          '50%': { transform: 'translateX(2px)' },
          '75%': { transform: 'translateX(-2px)' },
          '100%': { transform: 'translateX(2px)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out',
        'vibrate': 'vibrate 0.5s linear infinite',
      },
      colors: {
        customBlue: '#e8f7fb',
      },      
    },
  },
  plugins: [require('tailwind-scrollbar')],
};
