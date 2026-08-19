import { base, type BuiltinPreset } from './types'

/** Looks that move. */
export const MOTION_PRESETS: readonly BuiltinPreset[] = [
  {
    id: 'floating-turntable',
    name: 'Floating turntable',
    description: 'Lifted off the plinth, slowly rotating. Good for a loop.',
    group: 'Motion',
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

  {
    id: 'hero-reveal',
    name: 'Hero reveal',
    description: 'Rises and turns into place once. For an opening shot.',
    group: 'Motion',
    build: () => {
      const scene = base()
      scene.animation.clip = 'reveal'
      scene.animation.duration = 2.4
      scene.animation.loop = false
      scene.animation.easing = 'ease-out'
      scene.camera.preset = 'hero'
      return scene
    },
  },
]
