/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf4f7',
          100: '#fbe8ef',
          200: '#f7d2e0',
          300: '#f1adc7',
          400: '#e77da5',
          500: '#d94c7f',
          600: '#c43365',
          700: '#a62450',
          800: '#8b2044',
          900: '#751e3c',
          950: '#460c20',
        },
        champagne: {
          50: '#faf7f2',
          100: '#f5eee3',
          200: '#ebdcbf',
          300: '#dfc699',
          400: '#d1ad71',
          500: '#bf9452',
          600: '#a77a42',
          700: '#845e36',
          800: '#6d4c31',
          900: '#5a3f2b',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-subtle': 'pulseSubtle 2s infinite ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        }
      }
    },
  },
  plugins: [],
}
