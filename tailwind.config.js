/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#FAF7F2',
        surface: '#FFFFFF',
        ink: {
          900: '#2B2622',
          700: '#4A423B',
          500: '#6B6259',
          300: '#A89F94',
        },
        accent: {
          DEFAULT: '#C4704B',
          hover: '#B5623D',
          soft: '#E8C9B5',
          50: '#FAF0EB',
        },
        sage: {
          DEFAULT: '#8A9B8E',
          soft: '#D4DED6',
          50: '#EEF2EF',
        },
        error: {
          DEFAULT: '#B3564D',
          soft: '#E8C9C5',
          50: '#FAEEED',
        },
        border: {
          warm: '#EDE6DC',
        },
      },
      fontFamily: {
        serif: ['Fraunces', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        warm: '0 2px 8px rgba(43, 38, 34, 0.06)',
        'warm-md': '0 6px 24px rgba(43, 38, 34, 0.08)',
        'warm-lg': '0 12px 40px rgba(43, 38, 34, 0.10)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease',
        'fade-up': 'fade-up 0.4s ease',
        'slide-in': 'slide-in 0.3s ease',
        shimmer: 'shimmer 1.8s ease-in-out infinite',
        'spin-slow': 'spin-slow 3s linear infinite',
      },
    },
  },
  plugins: [],
};
