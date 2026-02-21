/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        light: {
          bg: "var(--color-light-bg)",
          surface: "var(--color-light-surface)",
          "surface-dark": "var(--color-light-surface-dark)",
          border: "var(--color-light-border)",
          "border-focus": "var(--color-light-border-focus)",
          text: "#111827",
          "text-secondary": "#6B7280",
          "text-muted": "#9CA3AF",
        },
        dark: {
          bg: "var(--color-dark-bg)",
          surface: "var(--color-dark-surface)",
          "surface-light": "var(--color-dark-surface-light)",
          border: "var(--color-dark-border)",
          "border-focus": "var(--color-dark-border-focus)",
          text: "#FFFFFF",
          "text-secondary": "#A0A0A0",
          "text-muted": "#6B6B6B",
        },
        primary: {
          DEFAULT: "var(--color-primary)",
          dark: "var(--color-primary-dark)",
          light: "var(--color-primary-light)",
        },
      },
    },
  },
  plugins: [],
};
