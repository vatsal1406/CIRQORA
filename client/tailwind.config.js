/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        carbon: {
          bg: '#080A0F',
          surface: '#0F131A',
          card: '#151A24',
          hover: '#1B2230',
          border: '#232C3D',
          borderLight: '#303B50',
        },
        primary: {
          DEFAULT: '#10B981',
          hover: '#059669',
          light: '#34D399',
          dark: '#047857',
          glow: 'rgba(16, 185, 129, 0.15)',
        },
        secondary: {
          DEFAULT: '#06B6D4',
          hover: '#0891B2',
          light: '#22D3EE',
          glow: 'rgba(6, 182, 212, 0.15)',
        },
        text: {
          primary: '#F9FAFB',
          secondary: '#9CA3AF',
          muted: '#6B7280',
          inverted: '#030712',
        },
        scope: {
          1: '#F59E0B',
          2: '#06B6D4',
          3: '#10B981',
        },
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          info: '#3B82F6',
        },
        ai: {
          badge: '#8B5CF6',
          bg: '#1E1B4B',
          glow: 'rgba(139, 92, 246, 0.2)',
          border: '#4C1D95',
        },
        chart: {
          cyan: '#06B6D4',
          emerald: '#10B981',
          amber: '#F59E0B',
          purple: '#8B5CF6',
          rose: '#F43F5E',
          blue: '#3B82F6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        card: '0.75rem',
        badge: '9999px',
        input: '0.5rem',
        btn: '0.5rem',
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        glow: '0 0 20px -5px rgba(16, 185, 129, 0.3)',
        cyanGlow: '0 0 20px -5px rgba(6, 182, 212, 0.3)',
        aiGlow: '0 0 20px -5px rgba(139, 92, 246, 0.3)',
      }
    },
  },
  plugins: [],
};
