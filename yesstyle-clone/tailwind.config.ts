import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ee',
          100: '#fdedd6',
          200: '#fad9ac',
          300: '#f6bf75',
          400: '#f19d3d',
          500: '#ed8214',
          600: '#e0650f',
          700: '#bc4a0d',
          800: '#953a10',
          900: '#773010',
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-playfair)', 'serif'],
      },
      container: {
        center: true,
        padding: '1.5rem',
        screens: { sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1400px' },
      },
    },
  },
  plugins: [],
};
export default config;