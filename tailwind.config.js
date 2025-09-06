import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0b0b10",
        panel: "rgba(255,255,255,0.04)",
        border: "rgba(255,255,255,0.08)",
        primary: "#7c3aed",
        primaryHover: "#8b5cf6",
        textDim: "rgba(255,255,255,0.65)",
      },
      boxShadow: {
        soft: "0 8px 30px rgba(0,0,0,0.28)",
        glow: "0 0 0 1px rgba(124,58,237,.35), 0 8px 30px rgba(124,58,237,.15)",
      },
      backdropBlur: { xs: "2px" },
    },
  },
  plugins: [],
} satisfies Config;
