import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'coverage', 'node_modules']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      /**
       * "No long code files" is a hard project requirement, so it is enforced by
       * the build rather than by discipline. If a file trips this, it is a signal
       * to extract a component, a hook, or a pure helper — not to raise the limit.
       */
      'max-lines': ['error', { max: 150, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': [
        'error',
        { max: 80, skipBlankLines: true, skipComments: true },
      ],
      'max-depth': ['error', 4],
      complexity: ['error', 12],

      /**
       * Features are self-contained slices. They may import each other's public
       * barrel (`@/features/scene`) but never reach into internals
       * (`@/features/scene/Backdrop`), which keeps refactors local.
       */
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*/*'],
              message:
                'Import a feature through its public barrel (@/features/<name>), not its internals.',
            },
          ],
        },
      ],

      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // `== null` is the idiomatic nullish check; everything else stays strict.
      eqeqeq: ['error', 'always', { null: 'ignore' }],
    },
  },
  {
    /**
     * The three.js layer.
     *
     * `react-hooks/immutability` forbids mutating values returned from hooks. That
     * is right for React state, but three.js objects (renderer, scene, materials,
     * geometries) are mutable by design and are NOT React state — mutating them is
     * the documented React Three Fiber pattern, not a bug. The rule is therefore
     * scoped off here and stays on everywhere else.
     *
     * This is the same purity assumption that made the React Compiler a poor fit;
     * see docs/adr/0002-drop-react-compiler.md.
     */
    files: [
      'src/features/scene/**/*.tsx',
      'src/features/lighting/**/*.tsx',
      'src/features/camera/**/*.tsx',
      'src/features/devices/**/*.tsx',
      'src/features/screen/**/*.tsx',
      'src/features/capture/**/*.ts*',
    ],
    rules: {
      'react-hooks/immutability': 'off',
    },
  },
  {
    // Tests and the local catalogue of device data are allowed to be longer:
    // they are declarative, not logic, and splitting them would hurt readability.
    files: ['**/*.{test,spec}.{ts,tsx}'],
    rules: {
      'max-lines': 'off',
      'max-lines-per-function': 'off',
    },
  },
])
