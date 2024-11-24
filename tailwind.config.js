/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#22272e",
        white: "#FFF",
        gray: "#CAC6C3",
        blueColor: "#19ADC8",
        greyIsh: "#f1f4f8",
        cardShadow: "#f7f8f9",
        textColor: "#252636",
        textBox: "#3C434A",
      },
    },
  },
  plugins: [],
};
