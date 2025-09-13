/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // <-- Habilita el modo oscuro controlado por clase
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#f8fafc", // claro: slate-50
          dark: "#0f172a", // oscuro: slate-900
        },
        surface: {
          DEFAULT: "#f1f5f9", // claro: slate-100
          dark: "#1e293b", // oscuro: slate-800
        },
        foreground: {
          DEFAULT: "#0f172a", // claro: slate-900
          dark: "#f8fafc", // oscuro: slate-50
        },
        primary: {
          DEFAULT: "hsl(0, 0%, 9%)",
          foreground: "hsl(0 0% 98%)",
        },
        secondary: {
          DEFAULT: "hsl(0, 0%, 96.1%)",
          foreground: "hsl(0, 0%, 9%)",
        },
        destructive: {
          DEFAULT: "hsl(0, 84.2%, 60.2%)",
          foreground: "hsl(0, 0%, 98%)",
        },
        // muted: {
        //   DEFAULT: "hsl(0, 0%, 96.1%)",
        //   foreground: "hsl(0, 0%, 45.1%)",
        // },
        accent: {
          DEFAULT: "hsl(0, 0%, 96.1%)",
          foreground: "hsl(0, 0%, 9%)",
        },
        popover: {
          DEFAULT: "hsl(0, 0%, 100%)",
          foreground: "hsl(var(0, 0%, 3.9%)",
        },
      },
    },
  },
  plugins: [],
};
