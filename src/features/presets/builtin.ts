import { applyLightingPreset, findLightingPreset } from '@/features/lighting'
import type { SceneState } from './manifest'
import { defaultSceneState } from './manifest'

/**
 * Premade looks that ship with the app.
 *
 * Each is a partial override of the default scene, applied on top rather than
 * declared in full — so a preset written today keeps working when a new field is
 * added tomorrow, and the diff shows what the preset actually changes.
 */
export interface BuiltinPreset {
  id: string
  name: string
  description: string
  build: () => SceneState
}

const lighting = (id: string) => {
  const preset = findLightingPreset(id)
  return preset ? applyLightingPreset(preset) : defaultSceneState().lighting
}

function base(): SceneState {
  return defaultSceneState()
}

export const BUILTIN_PRESETS: readonly BuiltinPreset[] = [
  {
    id: 'clean-studio',
    name: 'Clean studio',
    description: 'Bright neutral sweep, soft light. The safe default.',
    build: () => base(),
  },
  {
    id: 'dark-hero',
    name: 'Dark hero',
    description: 'Black room, hard key, cold rim. High contrast.',
    build: () => {
      const scene = base()
      scene.scene.backdrop.mode = 'glow'
      scene.scene.backdrop.color = '#0d0e11'
      scene.scene.backdrop.accent = '#2a3547'
      scene.scene.pedestal.color = '#15161a'
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
    description: 'Magenta and cyan rim lights over a dark room.',
    build: () => {
      const scene = base()
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
    id: 'catalogue-white',
    name: 'Catalogue white',
    description: 'Flat white background, even light. Store listings.',
    build: () => {
      const scene = base()
      scene.scene.backdrop.mode = 'solid'
      scene.scene.backdrop.color = '#f7f6f3'
      scene.scene.pedestal.enabled = false
      scene.scene.shadow.opacity = 0.28
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
    description: 'Technical grid floor, cool light, no pedestal.',
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
    id: 'floating-turntable',
    name: 'Floating turntable',
    description: 'Product lifted off the plinth, slowly rotating.',
    build: () => {
      const scene = base()
      scene.device.levitate = 0.35
      scene.scene.shadow.opacity = 0.3
      scene.scene.shadow.blur = 4
      scene.animation.clip = 'turntable'
      scene.animation.duration = 8
      scene.camera.preset = 'floating'
      return scene
    },
  },
]

export function findBuiltinPreset(id: string): BuiltinPreset | undefined {
  return BUILTIN_PRESETS.find((preset) => preset.id === id)
}
