import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const isElectron = process.argv.includes('--electron')

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: isElectron ? 'dist' : 'dist',
    rollupOptions: isElectron
      ? {
          input: {
            main: path.resolve(__dirname, 'index.html'),
            preload: path.resolve(__dirname, 'src/electron/preload.ts'),
          },
          output: {
            dir: 'dist',
            format: 'es',
          },
        }
      : {},
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
