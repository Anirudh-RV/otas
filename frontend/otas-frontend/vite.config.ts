import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["tree-sitter-python"], // exclude native
  },
  build: {
    rollupOptions: {
      external: ["fs", "path"], // if tree-sitter tries to require these
    },
  },
});
