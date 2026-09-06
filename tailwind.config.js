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
          950: '#062818',
          900: '#0d4a2e',
          800: '#116644',
          700: '#1a7a52',
        },
        gold: {
          300: '#f9e08a',
          400: '#f5d061',
          500: '#e6b422',
          600: '#c9971a',
        },
        card: {
          red: '#8b1a1a',
          cream: '#f5f0e6',
        },
      },
      fontFamily: {
        display: ['Georgia', 'Times New Roman', 'serif'],
      },
      boxShadow: {
        card: '0 4px 12px rgba(0,0,0,0.35), 0 1px 3px rgba(0,0,0,0.2)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.45), 0 2px 6px rgba(0,0,0,0.25)',
        'card-panel':
          '0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.06)',
        'gold-glow': '0 0 30px rgba(230, 180, 34, 0.15)',
      },
      backgroundImage: {
        'gold-shimmer':
          'linear-gradient(135deg, rgba(245,208,97,0.15) 0%, transparent 50%, rgba(245,208,97,0.08) 100%)',
      },
    },
  },
  plugins: [],
};
