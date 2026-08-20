/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    screens: {
      xs: '380px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        felt: {
          900: '#0d4a2e',
          800: '#116644',
          700: '#1a7a52',
        },
        gold: {
          400: '#f5d061',
          500: '#e6b422',
          600: '#c9971a',
        },
      },
      fontFamily: {
        display: ['Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 4px 12px rgba(0,0,0,0.35), 0 1px 3px rgba(0,0,0,0.2)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.45), 0 2px 6px rgba(0,0,0,0.25)',
      },
    },
  },
  plugins: [],
};
