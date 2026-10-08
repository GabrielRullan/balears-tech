/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ocean: {
          50: '#f0f7fc',
          100: '#e0eff9',
          200: '#b9dffe',
          300: '#7cc4fd',
          400: '#36a5fa',
          500: '#00558f',
          600: '#004778',
          700: '#003d69',
          800: '#003d69',
          900: '#0f172a'
        },
        teal: {
          50: '#f0fdfa',
          400: '#2dd4bf',
          500: '#0ea5a8',
          600: '#0d9488',
          700: '#0f766e'
        },
        coral: {
          50: '#fff7ed',
          400: '#fb923c',
          500: '#ff7a38',
          600: '#ea580c',
          700: '#c2410c'
        },
        surface: {
          light: '#fafcfd',
          dark: '#0f172a',
          cardLight: '#ffffff',
          cardDark: '#1e293b'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      boxShadow: {
        subtle: '0 4px 20px -2px rgba(0, 85, 143, 0.08)',
        elevated: '0 16px 36px -8px rgba(0, 61, 105, 0.20)',
        glow: '0 0 25px rgba(14, 165, 168, 0.35)'
      }
    }
  },
  plugins: []
};
