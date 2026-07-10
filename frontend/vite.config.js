import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

// Fix for ES modules __dirname requirement in newer Vite configurations
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [
    react()
  ],
  resolve: {
    dedupe: ['react', 'react-dom'], // Forces a single isolated React instance globally
    alias: {
      '@': path.resolve(__dirname, './src'), // Secures your relative imports
    },
  },
})