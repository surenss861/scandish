import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Allow external connections
    port: 5173,
    strictPort: true, // throws error if 5173 is already in use
    proxy: {
      "/api": process.env.VITE_BACKEND_URL || "https://api.scandish.ca"
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['framer-motion', 'lucide-react']
        }
      }
    }
  },
  define: {
    __SCANDISH_BUILD_TIME__: JSON.stringify(new Date().toISOString())
  }
});
