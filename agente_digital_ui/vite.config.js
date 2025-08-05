import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import compression from 'vite-plugin-compression'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    compression({
      algorithm: 'gzip',
      threshold: 10240
    }),
    visualizer({
      filename: 'dist/stats.html',
      open: false // Cambiar a true si quieres que se abra automáticamente
    })
  ],
  server: {
    hmr: {
      overlay: true // Te muestra errores inmediatamente
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: [], // No externalizar nada crítico
      output: {
        manualChunks: undefined // Evita problemas de chunks
      }
    },
    sourcemap: false, // Desactivar en producción
    minify: 'esbuild' // Más estable que terser
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
