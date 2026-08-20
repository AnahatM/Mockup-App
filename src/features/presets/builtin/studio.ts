import { base, lighting, type BuiltinPreset } from './types'

/** Clean, photographic looks. The everyday defaults. */
export const STUDIO_PRESETS: readonly BuiltinPreset[] = [
  {
    id: 'clean-studio',
    name: 'Clean studio',
    description: 'Bright cove sweep, soft directional key. The safe default.',
    group: 'Studio',
    build: () => base(),
  },

  {
    id: 'soft-light',
    name: 'Soft light',
    description: 'Large wrapping sources, almost no shadow. Flattering and neutral.',
    group: 'Studio',
    build: () => {
      const scene = base()
      scene.lighting = lighting('soft')
      scene.scene.shadow.opacity = 0.3
      scene.scene.shadow.blur = 4
      scene.scene.post.aoIntensity = 1.1
      return scene
    },
  },

  {
    id: 'glass-desk',
    name: 'Glass desk',
    description: 'Warm room, glossy back, polished rails. Feels like a photograph.',
    group: 'Studio',
    build: () => {
      const scene = base()
      scene.device.backFinish = 'gloss-glass'
      scene.device.frameFinish = 'polished-metal'
      scene.scene.backdrop.mode = 'environment'
      scene.scene.backdrop.structure.kind = 'tiles'
      scene.scene.backdrop.structure.pitch = 0.9
      scene.scene.backdrop.structure.depth = 0.05
      scene.scene.backdrop.structure.relief = 0.12
      scene.scene.backdrop.structure.color = '#2b2723'
      scene.scene.backdrop.structure.accent = '#4a423a'
      scene.scene.backdrop.structure.roughness = 0.35
      scene.lighting = lighting('moody')
      scene.lighting.room.intensity = 0.8
      scene.camera.preset = 'three-quarter'
      return scene
    },
  },
]
