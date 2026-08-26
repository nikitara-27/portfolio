import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Served from the custom domain (nikitaradash.com) at the root, not a
  // GitHub Pages project-site subpath — asset URLs need no prefix.
  base: '/',
  server: {
    port: Number(process.env.PORT) || 5173,
    strictPort: true,
  },
})
