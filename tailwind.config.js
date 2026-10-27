import tailwindcssAnimate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'var(--dx-accent, #0070F3)',
          glow: 'var(--dx-accent-glow, rgba(0, 112, 243, 0.4))',
          soft: 'var(--dx-accent-soft, rgba(0, 112, 243, 0.15))',
          foreground: '#ffffff',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'var(--dx-accent, #0070F3)',
        cuddle: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#0c1a3b',
        },
        midnight: {
          DEFAULT: '#070b14',
          950: '#070b14',
          900: '#0b1120',
          850: '#0c1322',
          800: '#0f172a',
          700: '#1e293b',
          600: '#334155',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        'blue-glow': '0 0 25px -5px rgba(37, 99, 235, 0.45)',
        'cyan-glow': '0 0 20px -3px rgba(6, 182, 212, 0.45)',
        'card-elevated': '0 10px 30px -10px rgba(0, 0, 0, 0.8), 0 0 1px 1px rgba(56, 189, 248, 0.15)',
        'accent-glow': '0 0 25px -5px var(--dx-accent-glow, rgba(0, 112, 243, 0.45))',
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
