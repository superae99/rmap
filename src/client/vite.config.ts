import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
  build: {
    rollupOptions: {
      external: [], // Ensure no external dependencies cause issues
      output: {
        manualChunks: undefined, // Disable manual chunking to avoid rollup issues
      },
    },
  },
  server: {
    port: 4000,
    host: 'localhost',
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})