import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/** Vendor chunks. three.js and the post-processing stack are large and change
 *  rarely, so splitting them keeps the app chunk small and cacheable. */
const VENDOR_CHUNKS: ReadonlyArray<readonly [chunk: string, match: string]> = [
  ['postfx', 'node_modules/postprocessing/'],
  ['r3f', 'node_modules/@react-three/'],
  ['three', 'node_modules/three/'],
]

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
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalised = id.replace(/\\/g, '/')
          return VENDOR_CHUNKS.find(([, match]) => normalised.includes(match))?.[0]
        },
      },
    },
  },
})
