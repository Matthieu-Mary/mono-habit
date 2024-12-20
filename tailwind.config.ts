import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: "#f6f7f6",
          100: "#e3e7e3",
          200: "#c8d1c8",
          300: "#a7b5a7",
          400: "#869886",
          500: "#6b7d6b",
          600: "#556455",
          700: "#455145",
          800: "#3a433a",
          900: "#333833",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
