import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        onyx: "#0A0A0A",
        onyx2: "#111111",
        ivory: "#FDFDFD",
        gold: {
          DEFAULT: "#D4AF37",
          light: "#E8C766",
          dark: "#A98526",
        },
        rosegold: "#E8A6B8",
        pink: "#FF5FA2",
        garnet: "#E74C3C",
        success: "#2ECC71",
        graphite: {
          DEFAULT: "#3A3A3C",
          light: "#5A5A5D",
        },
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      letterSpacing: {
        eyebrow: "0.25em",
      },
      keyframes: {
        thread: {
          "0%": { width: "0%", opacity: "0" },
          "10%": { opacity: "1" },
          "100%": { width: "100%", opacity: "1" },
        },
        sparkle: {
          "0%, 100%": { opacity: "0.3", transform: "scale(0.9)" },
          "50%": { opacity: "1", transform: "scale(1.1)" },
        },
      },
      animation: {
        thread: "thread 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        sparkle: "sparkle 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
