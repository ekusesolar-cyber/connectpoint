import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0e1a',
        surface: '#131829',
        'surface-hover': '#1a2035',
        primary: {
          DEFAULT: '#eab308',
          hover: '#ca8a04',
          light: '#fef08a',
        },
        secondary: {
          DEFAULT: '#22c55e',
          hover: '#16a34a',
          light: '#bbf7d0',
        },
        accent: {
          DEFAULT: '#3b82f6',
          hover: '#2563eb',
        },
        danger: {
          DEFAULT: '#ef4444',
          hover: '#dc2626',
        },
        'text-primary': '#f8fafc',
        'text-secondary': '#94a3b8',
        border: '#1e293b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
