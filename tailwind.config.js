/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./contract/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        healthcare: {
          bg: '#FDFBF7',
          panel: '#F5F0E6',
          panelDark: '#EFE9DC',
          accent: '#3E7C59',
          accentHover: '#33684A',
          warn: '#E8A798',
          warnBg: '#FDF2F0',
          critical: '#C75450',
          criticalBg: '#FDF0F0',
          border: '#E4DCC9',
          text: '#2B2A28',
          subtext: '#6B6A66',
        },
        // Retained for backward-compatibility in /dev debug view
        midnight: {
          950: '#060913',
          900: '#0b1120',
          850: '#10192e',
          800: '#16223e',
        },
        shield: {
          cyan: '#00f2fe',
          teal: '#4facfe',
          emerald: '#10b981',
          rose: '#f43f5e',
          amber: '#f59e0b',
          purple: '#8b5cf6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Nunito Sans', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'healthcare': '0 4px 20px -2px rgba(43, 42, 40, 0.05), 0 2px 6px -1px rgba(43, 42, 40, 0.03)',
        'healthcare-lg': '0 10px 30px -5px rgba(43, 42, 40, 0.08), 0 4px 12px -2px rgba(43, 42, 40, 0.04)',
      }
    },
  },
  plugins: [],
}

