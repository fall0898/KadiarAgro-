/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F0FDF4', 100: '#DCFCE7', 200: '#BBF7D0', 300: '#86EFAC',
          400: '#4ADE80', 500: '#22C55E', 600: '#16A34A', 700: '#15803D',
          800: '#166534', 900: '#14532D', 950: '#052E16',
        },
        secondary: {
          50: '#FFFBEB', 100: '#FEF3C7', 200: '#FDE68A', 300: '#FCD34D',
          400: '#FBBF24', 500: '#F59E0B', 600: '#D97706', 700: '#B45309',
          800: '#92400E', 900: '#78350F',
        },
        accent: {
          50: '#EFF6FF', 100: '#DBEAFE', 200: '#BFDBFE', 300: '#93C5FD',
          400: '#60A5FA', 500: '#3B82F6', 600: '#2563EB', 700: '#1D4ED8',
        },
        neutral: {
          50: '#FAFAF9', 100: '#F5F5F4', 200: '#E7E5E4', 300: '#D6D3D1',
          400: '#A8A29E', 500: '#78716C', 600: '#57534E', 700: '#44403C',
          800: '#292524', 900: '#1C1917',
        },
        success: { light: '#F0FDF4', DEFAULT: '#22C55E', dark: '#15803D' },
        warning: { light: '#FFFBEB', DEFAULT: '#F59E0B', dark: '#B45309' },
        error: { light: '#FEF2F2', DEFAULT: '#EF4444', dark: '#B91C1C' },
        info: { light: '#EFF6FF', DEFAULT: '#3B82F6', dark: '#1D4ED8' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
