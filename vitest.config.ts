import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react-swc"
import path from "path"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
  },
  resolve: {
    alias: {
      "@lib": path.resolve(__dirname, "./src/lib"),
      "@modules": path.resolve(__dirname, "./src/modules"),
      "@pages": path.resolve(__dirname, "./src/pages"),
    },
  },
})
