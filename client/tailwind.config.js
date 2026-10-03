/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif']
      },
      colors: {
        ink: '#1f2a24',
        sand: { 50: '#fbf8f3', 100: '#f6f1e9', 200: '#ece4d7', 300: '#ddd2c0' },
        forest: { 50: '#eef5f1', 100: '#d9e9e0', 200: '#b4d3c1', 600: '#2d6a4f', 700: '#1f4d3a', 800: '#173b2d', 900: '#10291f' },
        clay: { 50: '#fcf0ec', 100: '#f8dcd3', 500: '#d9694f', 600: '#c8553d', 700: '#a8432e' }
      },
      boxShadow: { soft: '0 6px 20px rgba(31,42,36,.07)' }
    }
  },
  plugins: []
};
