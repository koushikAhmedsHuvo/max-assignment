import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2d7a4f',
          light: '#3a9461',
          dark: '#1f5238',
        },
        dark: {
          bg: '#000000',
          sidebar: '#000000',
          card: '#0a0a0a',
        },
      },
      fontFamily: {
        arabic: ['var(--font-scheherazade)', 'serif'],
        amiri: ['var(--font-amiri)', 'serif'],
        kfgq: ['KFGQ', 'serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
