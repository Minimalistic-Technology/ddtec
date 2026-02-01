/** @type {import('tailwindcss').Config} */
const tailwindConfig = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0d9488", // teal-600
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#0f172a", // slate-900
          foreground: "#f8fafc", // slate-50
        },
        accent: {
          DEFAULT: "#10b981", // emerald-500
          foreground: "#ffffff",
        },
      },
      fontFamily: {
        poppins: ["var(--font-poppins)", "sans-serif"],
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.6s ease-out both",
        slideInRight: "slideInRight 0.5s ease-out both",
        float: "float 4s ease-in-out infinite",
      },
      container: {
        center: true,
        padding: "1.5rem",
        screens: {
          "2xl": "1280px",
        },
      },
    },
  },
  plugins: [],
};

export default tailwindConfig;
