import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'node-fetch': path.resolve(__dirname, 'src/node-fetch-shim.js'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        // No rewrite: keep the /api prefix so the backend routes match
      },
      '/datasets': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        // Static dataset files are served from the backend /datasets endpoint
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
