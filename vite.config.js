import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,   // ngrok needs this
    port: 5173,
    allowedHostsedHosts: true,
    allowedHosts: true,
  },
  preview: {
    allowedHosts: true,
  }
})