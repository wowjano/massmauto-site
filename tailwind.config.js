/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      screens: {
        // Custom breakpoint for when the full inline filters should appear
        lgFilters: "1024px",
        // Custom breakpoint for when header switches to hamburger
        nav: "1100px",
      },
    },
  },
  plugins: [],
};
