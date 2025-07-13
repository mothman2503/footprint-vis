/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        growRing: {
          '0%': { transform: 'scale(0.6)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },

        tooltipFadeIn: {
          '0%': { opacity: 0, transform: 'scale(0.95)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },

        tooltipFadeOut: {
          '0%': { opacity: 1, transform: 'scale(1)' },
          '100%': { opacity: 0, transform: 'scale(0.95)' },
        },
      },
      animation: {
        growRing: 'growRing 0.3s ease-out forwards',
        tooltipFadeIn: 'tooltipFadeIn 0.25s ease-out forwards',
        tooltipFadeOut: 'tooltipFadeOut 0.2s ease-in forwards',

      },
      colors: {
        categoryMagenta: '#ff00ff',
      },
    },
  },
  plugins: [],
}