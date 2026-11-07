import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// In dev, every request that starts with /api is forwarded to the FastAPI backend,
// so the browser never has to deal with CORS and you don't need VITE_API_URL locally.
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})
