/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'rarity-n': '#9CA3AF',
        'rarity-r': '#3B82F6',
        'rarity-sr': '#A855F7',
        'rarity-ssr': '#F59E0B',
        'rarity-ur': '#EF4444',
        'element-fire': '#EF4444',
        'element-water': '#3B82F6',
        'element-earth': '#A16207',
        'element-wind': '#10B981',
        'element-light': '#FBBF24',
        'element-dark': '#6366F1',
        'game-primary': '#6366F1',
        'game-secondary': '#8B5CF6',
        'game-bg': '#0F172A',
        'game-card': '#1E293B',
        'game-border': '#334155',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shake': 'shake 0.5s ease-in-out',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(99, 102, 241, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.8)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
};
