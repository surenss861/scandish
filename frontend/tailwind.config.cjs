module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        black: "#080705",
        charcoal: "#40434E",
        wine: "#702632",
        cordovan: "#912F40",
        baby: "#FFFFFA",
        gold: "#F3C77E"
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 3s ease-in-out infinite",
        pulseQR: "pulseQR 2.6s ease-in-out infinite"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        pulseQR: {
          "0%, 100%": { transform: "scale(.96)", opacity: ".18" },
          "50%": { transform: "scale(1.04)", opacity: ".35" }
        }
      }
    }
  },
  plugins: []
};
