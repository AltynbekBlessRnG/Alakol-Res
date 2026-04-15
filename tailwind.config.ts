import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        sand: "#efe2ca",
        lake: "#4db0cb",
        pine: "#17352c",
        dune: "#a26a42",
        mist: "#f5f1e8",
        ink: "#132028"
      },
      boxShadow: {
        glow: "0 20px 60px rgba(10, 25, 31, 0.18)"
      },
      fontFamily: {
        display: ["Georgia", "Cambria", "Times New Roman", "serif"],
        body: ["ui-sans-serif", "system-ui", "sans-serif"]
      },
      backgroundImage: {
        grain:
          "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.14), transparent 22%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.08), transparent 18%), linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0))"
      }
    }
  },
  plugins: []
};

export default config;
