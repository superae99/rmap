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
        target: 'https://www.main-bvxea6i-fru7lrwunilmo.au.platformsh.site',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      },
    },
  },
})