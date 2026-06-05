/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1e3a5f',
          light: '#2a4f7a',
          dark: '#152a45',
        },
        amber: {
          accent: '#f59e0b',
          light: '#fbbf24',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 24px rgba(30, 58, 95, 0.08)',
        elevated: '0 8px 32px rgba(30, 58, 95, 0.12)',
      },
    },
  },
  plugins: [],
};
