/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ds: {
          page: '#0a0a0a',
          brand: '#6799fe',
          brandDeep: '#4176e6',
          brandLight: '#73a3d2',
          surface1: 'rgba(255, 255, 255, 0.06)',
          surface2: 'rgba(255, 255, 255, 0.04)',
          surface3: 'rgba(255, 255, 255, 0.02)',
          surfaceRaised: 'rgba(255, 255, 255, 0.25)',
          border: 'rgba(255, 255, 255, 0.08)',
          borderSecondary: 'rgba(255, 255, 255, 0.15)',
          borderStrong: 'rgba(255, 255, 255, 0.24)',
          textPrimary: '#ffffff',
          textSecondary: 'rgba(255, 255, 255, 0.8)',
          textMuted: 'rgba(255, 255, 255, 0.5)',
          textPlaceholder: 'rgba(255, 255, 255, 0.3)',
        },
        space: {
          950: '#0a0a0a',
          900: '#111111',
          850: '#161616',
          800: '#1c1c1c',
          700: '#262626',
        },
        pulse: {
          cyan: '#6799fe',
          violet: '#73a3d2',
          purple: '#8b5cf6',
          amber: '#f59e0b',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Host Grotesk', 'DM Sans', 'system-ui', 'sans-serif'],
        mono: ['Fragment Mono', 'Fira Code', 'ui-monospace', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
        'float-slow': 'floatSlow 6s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(circle at 50% 0%, var(--tw-gradient-stops))',
        'grid-pattern': 'linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
}
