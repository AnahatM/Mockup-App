import { base, lighting, type BuiltinPreset } from './types'

/**
 * Looks for the 2D window mockup.
 *
 * The built-in presets covered the 3D studio only, so the window compositor —
 * chrome, container treatment, shadow — had no starting points at all despite
 * having as many knobs as the scene does.
 */
export const WINDOW_PRESETS: readonly BuiltinPreset[] = [
  {
    id: 'glass-browser',
    name: 'Glass browser',
    description: 'Frosted browser chrome, soft spread shadow. Reads as a UI shot.',
    group: 'Window',
    build: () => {
      const scene = base()
      scene.flat.style = 'browser'
      scene.flat.containerStyle = 'glass-light'
      scene.flat.borderShape = 'curved'
      scene.flat.shadowStyle = 'spread'
      scene.flat.tabs = 2
      scene.scene.backdrop.mode = 'gradient'
      scene.scene.pedestal.enabled = false
      scene.lighting = lighting('soft')
      scene.camera.preset = 'front'
      return scene
    },
  },

  {
    id: 'macos-dark',
    name: 'macOS dark',
    description: 'Dark window chrome with traffic lights, inset edge, tight shadow.',
    group: 'Window',
    build: () => {
      const scene = base()
      scene.flat.style = 'macos'
      scene.flat.dark = true
      scene.flat.containerStyle = 'inset-dark'
      scene.flat.borderShape = 'round'
      scene.flat.shadowStyle = 'hug'
      scene.scene.backdrop.mode = 'solid'
      scene.scene.backdrop.color = '#1c1e26'
      scene.scene.pedestal.enabled = false
      scene.lighting = lighting('moody')
      scene.camera.preset = 'front'
      return scene
    },
  },

  {
    id: 'outlined-shot',
    name: 'Outlined shot',
    description: 'Hairline outline, square corners, no chrome. Documentation style.',
    group: 'Window',
    build: () => {
      const scene = base()
      scene.flat.style = 'none'
      scene.flat.containerStyle = 'outline'
      scene.flat.borderShape = 'sharp'
      scene.flat.shadowStyle = 'none'
      scene.scene.backdrop.mode = 'solid'
      scene.scene.backdrop.color = '#fdf0ed'
      scene.scene.pedestal.enabled = false
      scene.lighting = lighting('product-white')
      scene.camera.preset = 'front'
      return scene
    },
  },

  {
    id: 'bare-screenshot',
    name: 'Bare screenshot',
    description: 'The screenshot alone on the backdrop — no frame, no chrome.',
    group: 'Window',
    build: () => {
      const scene = base()
      scene.flat.hideMockup = true
      scene.flat.shadowStyle = 'adaptive'
      scene.scene.backdrop.mode = 'gradient'
      scene.scene.pedestal.enabled = false
      scene.camera.preset = 'front'
      scene.lighting = lighting('soft')
      return scene
    },
  },
]
