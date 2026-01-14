import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://pocketbase-production-edf2.up.railway.app/',
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  }
})
