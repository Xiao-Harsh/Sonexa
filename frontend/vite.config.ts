import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Raise warning threshold – bundle gzips to ~167 kB which is fine for CDN
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // Split vendor libraries into separate cacheable chunks (function form for Rolldown compatibility)
        manualChunks(id: string) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-motion';
          }
          if (id.includes('node_modules/axios') || id.includes('node_modules/zustand')) {
            return 'vendor-utils';
          }
        },
      },
    },
  },
})

