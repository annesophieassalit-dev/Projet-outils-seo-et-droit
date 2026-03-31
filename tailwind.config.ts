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
        // Vert sauge moderne — confiance, conformité, positif
        zen: {
          50:  "#eef9f4",
          100: "#d1f0e3",
          200: "#a3e1c7",
          300: "#6dcfaa",
          400: "#45bc8e",
          500: "#3aaa78",
          600: "#2e8f63",
          700: "#247551",
          800: "#1c5c40",
          900: "#144330",
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
