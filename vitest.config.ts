import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    // Node by default: the pure layers need no DOM and jsdom costs ~40s of setup.
    // Component tests opt in per file with `// @vitest-environment jsdom`.
    environment: 'node',
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      // Only the pure layers are meaningfully coverable; 3D components are
      // verified visually and via the end-to-end script in docs/planning/PLAN.md.
      include: ['src/lib/**', 'src/features/presets/**'],
    },
  },
})
