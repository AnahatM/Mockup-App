import { base, type BuiltinPreset } from './types'

/**
 * Looks built on the structured backdrops and procedural surfaces.
 *
 * These are the presets F15 and F16 were for. A knob nobody finds is a knob
 * that does not exist, and "hexagon tiles" is not something a user thinks to
 * go looking for under Backdrop — arriving at it by clicking a preset and then
 * adjusting is the realistic path to it.
 */
export const ENVIRONMENT_PRESETS: readonly BuiltinPreset[] = [
  {
    id: 'hex-field',
    name: 'Hex field',
    description: 'A hexagon-tiled floor rising away from the product.',
    group: 'Environment',
    build: () => {
      const scene = base()
      scene.scene.backdrop.mode = 'gradient'
      scene.scene.backdrop.color = '#cfd6e2'
      scene.scene.backdrop.accent = '#eef1f6'
      scene.scene.backdrop.structure.kind = 'hex'
      scene.scene.backdrop.structure.pitch = 0.62
      scene.scene.backdrop.structure.relief = 0.55
      scene.scene.backdrop.structure.color = '#c9cfda'
      scene.scene.backdrop.structure.accent = '#8fa2c0'
      // The plinth would sit on top of the field and hide the tiles it is
      // standing on, which is the one thing this look is for.
      scene.scene.pedestal.enabled = false
      return scene
    },
  },

  {
    id: 'tiled-room',
    name: 'Tiled room',
    description: 'A real room with tiled walls, shaded by its own corners.',
    group: 'Environment',
    build: () => {
      const scene = base()
      scene.scene.backdrop.mode = 'solid'
      scene.scene.backdrop.color = '#e6e3dd'
      scene.scene.backdrop.structure.kind = 'room'
      scene.scene.backdrop.structure.extent = 6
      scene.scene.backdrop.structure.wallHeight = 6
      scene.scene.backdrop.structure.pitch = 0.7
      scene.scene.backdrop.structure.color = '#dedbd4'
      scene.scene.backdrop.structure.accent = '#a9a49a'
      scene.scene.backdrop.structure.texture.kind = 'grain'
      scene.scene.backdrop.structure.texture.strength = 0.3
      // Corners only read as corners if something darkens them.
      scene.scene.post.aoIntensity = 2.4
      return scene
    },
  },

  {
    id: 'pulse-grid',
    name: 'Pulse grid',
    description: 'Blocks rippling outward from under the product.',
    group: 'Environment',
    build: () => {
      const scene = base()
      scene.scene.backdrop.mode = 'glow'
      scene.scene.backdrop.color = '#0e1016'
      scene.scene.backdrop.accent = '#22304a'
      scene.scene.backdrop.structure.kind = 'blocks'
      scene.scene.backdrop.structure.pitch = 0.5
      scene.scene.backdrop.structure.gap = 0.22
      scene.scene.backdrop.structure.pulse = 0.6
      scene.scene.backdrop.structure.speed = 0.22
      scene.scene.backdrop.structure.color = '#191d27'
      scene.scene.backdrop.structure.accent = '#4c6a9c'
      scene.scene.backdrop.structure.metalness = 0.35
      scene.scene.backdrop.structure.roughness = 0.42
      scene.scene.pedestal.enabled = false
      scene.scene.post.bloomIntensity = 0.7
      return scene
    },
  },

  {
    id: 'concrete-cove',
    name: 'Concrete cove',
    description: 'Cast-concrete sweep and plinth. Texture rather than colour.',
    group: 'Environment',
    build: () => {
      const scene = base()
      scene.scene.backdrop.color = '#cdc9c1'
      scene.scene.backdrop.texture.kind = 'noise'
      scene.scene.backdrop.texture.scale = 1.4
      scene.scene.backdrop.texture.strength = 0.28
      scene.scene.backdrop.texture.contrast = 0.3
      scene.scene.pedestal.color = '#bfbab1'
      scene.scene.pedestal.texture.kind = 'grain'
      scene.scene.pedestal.texture.scale = 3
      scene.scene.pedestal.texture.strength = 0.35
      scene.scene.post.aoIntensity = 2
      return scene
    },
  },
]
