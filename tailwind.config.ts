import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#FBF8F4",
        surface: "#FFFFFF",
        ink: "#2B2A33",
        muted: "#8A8696",
        border: "#E9E3D8",
        brand: {
          50: "#F1EEFD",
          100: "#E1DBFB",
          300: "#B6A8F2",
          500: "#6F5DD7",
          600: "#5B49C4",
          700: "#4936A0",
        },
        blush: {
          100: "#FCE9ED",
          300: "#F6BFCB",
          500: "#EE8FA3",
        },
        mint: {
          100: "#E3F5EC",
          400: "#5FBE93",
          600: "#2F8F65",
        },
        amber: {
          100: "#FDF0DD",
          400: "#E8A23B",
          600: "#B8761E",
        },
        danger: {
          100: "#FBE6E5",
          400: "#E2604F",
          600: "#B8392B",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        soft: "0 2px 10px rgba(43, 42, 51, 0.06)",
        card: "0 4px 16px rgba(43, 42, 51, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
