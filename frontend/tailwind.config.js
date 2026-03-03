/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#eefbf3',
          100: '#d6f5e3',
          200: '#b0eacb',
          300: '#7dd8aa',
          400: '#47be83',
          500: '#24a265',
          600: '#178150',
          700: '#136642',
          800: '#125137',
          900: '#10422e',
          950: '#072519',
        },
        surface: {
          900: '#0b0f0e',
          800: '#111714',
          700: '#182019',
          600: '#1f2a21',
          500: '#263329',
        }
      },
      backgroundImage: {
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2324a265' fill-opacity='0.04'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
      animation: {
        'score-fill': 'scoreFill 1.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'fade-up': 'fadeUp 0.5s ease forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.8s linear infinite',
      },
      keyframes: {
        scoreFill: {
          from: { 'stroke-dashoffset': '283' },
          to: { 'stroke-dashoffset': 'var(--target-offset)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(36,162,101,0)' },
          '50%': { boxShadow: '0 0 20px 4px rgba(36,162,101,0.25)' },
        },
        shimmer: {
          from: { backgroundPosition: '-200% 0' },
          to: { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
