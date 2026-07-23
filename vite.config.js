import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  // Served from a subpath on GitHub Pages (sydegaard.github.io/car-economy-analysis/)
  // in production; keep the dev server at root.
  base: mode === "production" ? "/car-economy-analysis/" : "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
}));
