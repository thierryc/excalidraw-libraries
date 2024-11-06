import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Serving static files from the public directory
  publicDir: 'public',
  // Development server configuration
  server: {
    port: 3000,
    open: true,
    // Add proxies if needed
    proxy: {
      // example: '/api': 'http://localhost:8080'
    }
  },
  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Customize chunks
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          // Add more manual chunks as needed
        }
      }
    }
  }
})