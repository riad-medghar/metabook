module.exports = {
  // ...existing config
  theme: {
    extend: {
      // ...existing theme extensions
      fontFamily: {
        arabic: ['Noto Sans Arabic', 'sans-serif']
      },
      keyframes: {
        'spin-slow': {
          to: {
            transform: 'rotate(360deg)',
          },
        },
      },
      animation: {
        'spin-slow': 'spin-slow 1.5s linear infinite',
      },
    }
  },
  plugins: [
    // ...existing plugins
  ]
};