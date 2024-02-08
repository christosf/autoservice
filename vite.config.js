import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue()
  ],
  meteor: {
    clientEntry: 'imports/startup/client/index.js'
  },
  optimizeDeps: {
    exclude: []
  }
})
