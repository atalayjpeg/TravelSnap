/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        'primary': '#0f172a',
        'secondary': '#0C4F69',
        'tertiary': '#00A3AD',
        'fourth': '#70FACB',
        'fifth' : '#020617',
        'white' : '#ffffff',
      },
    },
  },
  plugins: [],
}

