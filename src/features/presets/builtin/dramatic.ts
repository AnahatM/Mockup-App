import { base, lighting, type BuiltinPreset } from './types'

/** High-contrast looks that show off edges and materials. */
export const DRAMATIC_PRESETS: readonly BuiltinPreset[] = [
  {
    id: 'dark-hero',
    name: 'Dark hero',
    description: 'Dim room, hard key, cold rim. High contrast.',
    group: 'Dramatic',
    build: () => {
      const scene = base()
      scene.scene.backdrop.mode = 'glow'
      scene.scene.backdrop.color = '#0d0e11'
      scene.scene.backdrop.accent = '#2a3547'
      scene.scene.pedestal.color = '#15161a'
      scene.scene.pedestal.texture.kind = 'noise'
      scene.scene.pedestal.texture.strength = 0.25
      scene.scene.post.bloomThreshold = 0.7
      scene.scene.post.vignetteDarkness = 0.5
      scene.lighting = lighting('dramatic')
      scene.camera.preset = 'hero'
      return scene
    },
  },

  {
    id: 'neon-edge',
    name: 'Neon edge',
    description: 'Magenta and cyan rims over a dark room.',
    group: 'Dramatic',
    build: () => {
      const scene = base()
      scene.scene.backdrop.mode = 'glow'
      scene.scene.backdrop.color = '#0b0c12'
      scene.scene.backdrop.accent = '#3a1f52'
      scene.scene.pedestal.color = '#121218'
      scene.scene.post.bloomIntensity = 0.9
      scene.scene.post.bloomThreshold = 0.62
      scene.lighting = lighting('neon')
      return scene
    },
  },

  {
    id: 'rim-metal',
    name: 'Rim metal',
    description: 'Brushed rails lit from behind. Shows off edges and chamfers.',
    group: 'Dramatic',
    build: () => {
      const scene = base()
      scene.device.frameFinish = 'titanium'
      scene.device.backFinish = 'matte-glass'
      // The rim light is what shows a brushed grain; anywhere else on the
      // frame it would be too fine to see, which is why it lives on this
      // preset rather than on the titanium finish itself.
      scene.device.frameTexture.kind = 'brushed'
      scene.device.frameTexture.strength = 0.5
      scene.device.frameTexture.contrast = 0.28
      scene.lighting = lighting('rim-glow')
      scene.scene.post.aoIntensity = 2.2
      scene.camera.preset = 'macro'
      return scene
    },
  },
]
