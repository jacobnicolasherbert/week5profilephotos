const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
  safelist: [
    {
      pattern: /bg-(slate|fuchsia|sky|amber|zinc|emerald|rose|indigo)-(400|500|600|800|900)/,
    },
  ],
};

export default config;
