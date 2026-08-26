import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'teal-dark': '#0F3D3E',
        'teal-darker': '#0A2C2D',
        teal: '#1B7F7A',
        'teal-light': '#E6F3F2',
        scope1: '#8B1E3F',
        scope2: '#6B2C91',
        scope3up: '#E08E2A',
        scope3down: '#2F8F6E',
      },
    },
  },
  plugins: [],
};
export default config;
