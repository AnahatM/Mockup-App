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
    /*
     * Sized for the studio chunk, deliberately. Measured 2026-08-25:
     *
     *   StudioPage-*.js   1,430.72 kB   gzip: 431.37 kB
     *   index-*.js          377.72 kB   gzip: 117.68 kB   <- next largest
     *
     * The limit was 900 before, with the note "the postprocessing vendor chunk
     * is legitimately large" — which had stopped being true: there is no
     * postprocessing vendor chunk, and has not been since `manualChunks` was
     * removed. The number outlived its reason, so the warning it produced said
     * nothing and nobody acted on it.
     *
     * Why this size is accepted rather than split:
     *
     * 1. Only `/studio` pays it. The route is lazy, and `verify-bundle.mjs`
     *    holds every other route to a budget that three.js cannot fit inside.
     * 2. 87% of it is four packages — three, @react-three/fiber, n8ao and
     *    three-stdlib — and all of them are needed to draw the first frame of
     *    the default scene. Ambient occlusion is on by default, so deferring
     *    n8ao, the one plausible candidate, would buy a smaller first request
     *    and pay for it with a second round-trip and a shader recompile before
     *    the user sees anything.
     * 3. Splitting it into vendor chunks does not remove a byte; it changes
     *    which file the same bytes arrive in. The one real prize is cache
     *    granularity across deploys, and reaching for it is precisely what put
     *    three.js on the documentation pages last time — see ADR 0006 and the
     *    note above about chunking being left to the bundler.
     *
     * `/studio` transfers 647 kB gzipped in total. That is a WebGL application,
     * not a web page, and it is in line with comparable 3D tools.
     *
     * This is a tripwire, not a ceiling: it sits ~5% above the measured size, so
     * meaningful growth in the studio raises the warning again and somebody has
     * to make this argument afresh. Nothing else is remotely near it.
     */
    chunkSizeWarningLimit: 1500,
  },
})
