import tailwindcssAnimate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--dx-bg, #303841)',
        foreground: 'var(--dx-text, #F3F3F3)',
        card: {
          DEFAULT: 'var(--dx-bg-raised, #3A4750)',
          foreground: 'var(--dx-text, #F3F3F3)',
        },
        popover: {
          DEFAULT: 'var(--dx-surface-2, #3A4750)',
          foreground: 'var(--dx-text, #F3F3F3)',
        },
        primary: {
          DEFAULT: 'var(--dx-accent, #2185D5)',
          foreground: '#F3F3F3',
        },
        secondary: {
          DEFAULT: '#3A4750',
          foreground: '#F3F3F3',
        },
        muted: {
          DEFAULT: 'rgba(243, 243, 243, 0.08)',
          foreground: 'rgba(243, 243, 243, 0.65)',
        },
        accent: {
          DEFAULT: 'var(--dx-accent, #2185D5)',
          glow: 'var(--dx-accent-glow, rgba(33, 133, 213, 0.5))',
          soft: 'var(--dx-accent-soft, rgba(33, 133, 213, 0.18))',
          foreground: '#F3F3F3',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },
        border: 'var(--dx-line, rgba(243, 243, 243, 0.12))',
        input: 'rgba(243, 243, 243, 0.15)',
        ring: 'var(--dx-accent, #2185D5)',
        echora: {
          blue: '#2185D5',
          slate: '#3A4750',
          dark: '#303841',
          light: '#F3F3F3',
        },
        cuddle: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#2185D5',
          600: '#1a6cb0',
          700: '#14558c',
          800: '#0f3f68',
          900: '#0a2a47',
          950: '#051625',
        },
        midnight: {
          DEFAULT: '#303841',
          950: '#262d35',
          900: '#303841',
          850: '#353e48',
          800: '#3A4750',
          700: '#485764',
          600: '#5c6e7e',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        'blue-glow': '0 0 25px -5px rgba(33, 133, 213, 0.5)',
        'cyan-glow': '0 0 20px -3px rgba(33, 133, 213, 0.4)',
        'card-elevated': '0 10px 30px -10px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(243, 243, 243, 0.1)',
        'accent-glow': '0 0 25px -5px var(--dx-accent-glow, rgba(33, 133, 213, 0.5))',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
      },
      screens: {
        'min-1440': '1440px',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
