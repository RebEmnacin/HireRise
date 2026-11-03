import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// the vue() plugin is what lets Vite understand .vue files
export default defineConfig({
  plugins: [vue()],
})
