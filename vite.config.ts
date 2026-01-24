import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom', 'react-router'],
          
          // UI libraries
          'ui-vendor': ['react-bootstrap', 'react-bootstrap-icons', 'bootstrap'],
          
          // Code editor
          'editor-vendor': ['@monaco-editor/react'],
          
          'markdown-vendor':  ['@uiw/react-md-editor'],
          
          // Data fetching and state
          'query-vendor': ['@tanstack/react-query'],
          
          // Charts
          'chart-vendor': ['chart.js', 'react-chartjs-2'],
          
          // Video player
          'video-vendor': ['video.js'],
          
          // Stripe
          'stripe-vendor': ['@stripe/stripe-js', '@stripe/react-stripe-js'],
          
          // Icons
          'icon-vendor': ['react-icons'],
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:3333/',
        changeOrigin: true,
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: [
          'import',
          'color-functions',
          'global-builtin',
        ],
      },
    },
  },
})
