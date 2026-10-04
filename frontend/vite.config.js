import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // In development, forward API calls to the Express server.
    // In production (Vercel) the frontend and /api share the same domain.
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
})
