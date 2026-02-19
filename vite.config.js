import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
 
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['cts-vibeappuk7603-4.azurewebsites.net', 'localhost', 'cts-vibeappuk7603-4.azurewebsites.net'],
    port: 8080,    
    
    host: true
  },
})