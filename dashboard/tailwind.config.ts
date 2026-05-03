import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // SAFAR brand — dark navy background
        navy: {
          900: '#0a0f1e',
          800: '#0d1526',
          700: '#111c33',
          600: '#1a2744',
          500: '#243358',
        },
        // Severity levels
        severity: {
          green: '#22c55e',
          yellow: '#eab308',
          red: '#ef4444',
          black: '#1f2937',
        },
        // Accent
        safar: {
          green: '#22c55e',
          'green-dark': '#16a34a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
