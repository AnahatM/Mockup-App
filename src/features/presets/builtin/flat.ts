import { base, lighting, type BuiltinPreset } from './types'

/** Even, product-catalogue looks — and the transparent cutout. */
export const FLAT_PRESETS: readonly BuiltinPreset[] = [
  {
    id: 'catalogue-white',
    name: 'Catalogue white',
    description: 'Flat white, even light, no plinth. For store listings.',
    group: 'Flat',
    build: () => {
      const scene = base()
      scene.scene.backdrop.mode = 'solid'
      scene.scene.backdrop.color = '#f7f6f3'
      scene.scene.pedestal.enabled = false
      scene.scene.shadow.opacity = 0.26
      scene.scene.shadow.blur = 3.4
      scene.scene.post.vignetteEnabled = false
      scene.scene.post.bloomEnabled = false
      scene.lighting = lighting('product-white')
      scene.camera.preset = 'front'
      return scene
    },
  },

  {
    id: 'blueprint',
    name: 'Blueprint',
    description: 'Technical grid floor, cool light, no plinth.',
    group: 'Flat',
    build: () => {
      const scene = base()
      scene.scene.backdrop.mode = 'grid'
      scene.scene.backdrop.color = '#12151c'
      scene.scene.backdrop.accent = '#2f4a6b'
      scene.scene.pedestal.enabled = false
      scene.lighting = lighting('rim-glow')
      scene.camera.preset = 'three-quarter'
      return scene
    },
  },

  {
    id: 'transparent-cutout',
    name: 'Transparent cutout',
    description: 'No backdrop or plinth. Export a PNG to drop onto any design.',
    group: 'Flat',
    build: () => {
      const scene = base()
      scene.scene.backdrop.mode = 'transparent'
      scene.scene.pedestal.enabled = false
      scene.scene.shadow.enabled = false
      scene.scene.post.vignetteEnabled = false
      scene.exportConfig.transparent = true
      scene.lighting = lighting('soft')
      scene.camera.preset = 'front'
      return scene
    },
  },

  {
    id: 'app-store-portrait',
    name: 'App Store portrait',
    description: 'Head-on, tall crop, bright and even. Sized for a store listing.',
    group: 'Flat',
    build: () => {
      const scene = base()
      scene.scene.backdrop.mode = 'gradient'
      scene.scene.backdrop.color = '#e9edf5'
      scene.scene.backdrop.accent = '#ffffff'
      scene.scene.pedestal.enabled = false
      scene.camera.preset = 'front'
      scene.exportConfig.sizePreset = 'app-store-61'
      scene.lighting = lighting('product-white')
      return scene
    },
  },
]
