/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        light: {
          bg: "#F9FAFB",
          surface: "#FFFFFF",
          "surface-dark": "#F3F4F6",
          border: "#E5E7EB",
          "border-focus": "#7C3AED",
          text: "#111827",
          "text-secondary": "#6B7280",
          "text-muted": "#9CA3AF",
        },
        dark: {
          bg: "#111111",
          surface: "#1A1A1A",
          "surface-light": "#242424",
          border: "#2E2E2E",
          "border-focus": "#7C3AED",
          text: "#FFFFFF",
          "text-secondary": "#A0A0A0",
          "text-muted": "#6B6B6B",
        },
        primary: {
          DEFAULT: "#7C3AED",
          dark: "#6D28D9",
          light: "#8B5CF6",
        },
      },
    },
  },
  plugins: [],
};