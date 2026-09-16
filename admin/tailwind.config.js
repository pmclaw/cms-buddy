/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#E89E57',
          50: '#FBF1E5',
          100: '#F7E3CC',
          200: '#EFC79A',
          300: '#E7AB68',
          400: '#E89E57',
          500: '#D88A45',
          600: '#B87136',
          700: '#8E562A',
        },
        gray: {
          50: '#F8F9FB',
          100: '#F2F4F7',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(16, 24, 40, 0.04), 0 1px 3px 0 rgba(16, 24, 40, 0.06)',
        pop: '0 10px 30px -10px rgba(232, 158, 87, 0.35)',
      },
      fontFamily: {
        sans: ['"PingFang SC"', '"Microsoft YaHei"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
