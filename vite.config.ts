import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/*
 * Chunking is left to the bundler.
 *
 * There used to be a hand-written `manualChunks` here splitting three.js and
 * the post-processing stack into vendor chunks. It predated the lazy routes and
 * ended up fighting them: React's own files were being assigned into the `r3f`
 * chunk, so the React chunk imported the 3D chunk, and every route — the
 * landing page and the documentation included — downloaded three.js purely to
 * get React.
 *
 * Rolldown already splits on the dynamic-import boundaries the router declares,
 * which is the split that actually matters here. `scripts/verify-bundle.mjs`
 * and `scripts/verify-eager-graph.mjs` guard the outcome.
 */

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // The postprocessing vendor chunk is legitimately large and rarely changes.
    chunkSizeWarningLimit: 900,
  },
})
