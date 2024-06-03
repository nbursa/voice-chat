/** @type {import('tailwindcss').Config} */
export default {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: false,
  theme: {
    extend: {
      colors: {
        primary: {
          gray: '#587291',
          blue: '#2F97C1',
          light: '#1CCAD8',
          lighter: '#15E6CD',
          green: '#0CF574',
        }
      }
    }
  },
  variants: {
    extend: {},
  },
  plugins: [],
};