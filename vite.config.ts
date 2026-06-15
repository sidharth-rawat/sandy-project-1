import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      // Forward /api requests to the backend server-side, sidestepping CORS in dev.
      "/api": {
        target: "https://sandy-project-1-bd.onrender.com",
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
