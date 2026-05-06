import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Vert forêt premium — confiance, conformité, expertise
        zen: {
          50:  "#e6f0ea",
          100: "#c8ddd5",
          200: "#a8c5b8",
          300: "#84ab9b",
          400: "#648f81",
          500: "#4d776a",
          600: "#3c6356",
          700: "#2f5e4e",
          800: "#244a3d",
          900: "#19372d",
        },
        // Corail rosé — CTAs, inscription, upgrade
        coral: {
          50:  "#fef2f3",
          100: "#fde0e2",
          200: "#fbc4c8",
          300: "#f79ca3",
          400: "#f07b84",
          500: "#e86870",
          600: "#d44f59",
          700: "#b33c46",
          800: "#93333b",
          900: "#7a2d34",
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;
