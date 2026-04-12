/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#DEDBC8"
      },
      fontFamily: {
        serif: ['\"Instrument Serif\"', "serif"]
      },
      boxShadow: {
        cinematic: "0 24px 80px rgba(0, 0, 0, 0.45)"
      }
    }
  },
  plugins: []
};
