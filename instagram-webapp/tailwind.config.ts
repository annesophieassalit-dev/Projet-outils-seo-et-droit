import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        rose:  { 500: "#e84d73", 600: "#d43e64" },
        beige: { 50: "#eeeae4", 100: "#e5e0d8" },
      },
    },
  },
  plugins: [],
};

export default config;
