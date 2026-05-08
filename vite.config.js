import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig(({ command }) => ({
  root: 'client',
  base: command === 'serve' ? '/' : '/build/',
  plugins: [tailwindcss()],
  build: {
    outDir: path.resolve(process.cwd(), 'public/build'),
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: {
        app: path.resolve(process.cwd(), 'client/js/main.js')
      }
    }
  },
  server: {
    port: 5173,
    strictPort: true,
    cors: true
  }
}))