import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
export default defineConfig({
  base: "/web/",
  plugins: [react(), tailwindcss()],
  root: import.meta.dirname,
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "src"), "@assets": path.resolve(import.meta.dirname, "../../attached_assets") },
    dedupe: ["react", "react-dom"],
  },
  build: { outDir: path.resolve(import.meta.dirname, "dist/public"), emptyOutDir: true },
  server: { host: "0.0.0.0", port: 5173 },
});
