import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves this as a project site at /portfolio/, not the
  // domain root — every built asset URL needs that prefix baked in, or
  // they all resolve to the wrong (404) path once deployed.
  base: '/portfolio/',
  server: {
    port: Number(process.env.PORT) || 5173,
    strictPort: true,
  },
})
