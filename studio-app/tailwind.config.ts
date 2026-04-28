import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans:       ["var(--font-arimo)", "system-ui", "sans-serif"],
        montserrat: ["var(--font-montserrat)", "sans-serif"],
        arimo:      ["var(--font-arimo)", "sans-serif"],
        serif:      ["var(--font-playfair)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
