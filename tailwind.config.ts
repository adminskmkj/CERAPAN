import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#1d4ed8",
          600: "#1e40af",
          700: "#1e3a8a",
          800: "#172554",
          900: "#0f172a",
        },
        paper: {
          DEFAULT: "#f7f3eb",
          card: "#fbf8f1",
        },
        ink: {
          DEFAULT: "#161614",
          2: "#3a3733",
        },
        muted: "#6e6657",
        stone: {
          DEFAULT: "#e4ddcd",
          2: "#efeae0",
        },
        accent: {
          DEFAULT: "#1e3a8a",
          soft: "#e8edf6",
        },
        taraf: {
          cemerlang: "#16a34a",
          baik: "#2563eb",
          sederhana: "#d97706",
          ptps: "#dc2626",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "Times New Roman", "serif"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "22px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(22,22,20,0.04), 0 1px 1px rgba(22,22,20,0.03)",
        lift: "0 10px 30px -12px rgba(22,22,20,0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
