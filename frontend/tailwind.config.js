/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B2B33",
        primary: {
          50: "#EAF4F3", 100: "#CFE6E4", 300: "#7CB8B3",
          500: "#0F5C57", 600: "#0C4A46", 700: "#0A3B38", 900: "#062522",
        },
        teal: {
          400: "#1D9C8F", 500: "#12877F",
        },
        clay: "#D2691E",
        amber: "#D97706",
      },
      fontFamily: {
        display: ["'Sora'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
    },
  },
  plugins: [],
}
