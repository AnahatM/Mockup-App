import type { GestureEntry } from './types'

/**
 * Mouse/trackpad gestures and held-key navigation, documented here so the
 * `?` overlay shows the full picture of how to move around the viewport —
 * see `GestureEntry` for why none of these dispatch through `useShortcuts`.
 *
 * Actual behaviour lives in `features/camera` (`CameraRig`, `FlyCamera`,
 * `useSpacePan`); this is a plain description of it, kept next to the rest
 * of the shortcut reference instead of only in the manual, so the two
 * cannot say different things.
 */
export const GESTURES: readonly GestureEntry[] = [
  {
    id: 'orbit-drag',
    kind: 'gesture',
    group: 'Viewport',
    description: 'Orbit the product',
    display: 'Drag',
  },
  {
    id: 'orbit-pan',
    kind: 'gesture',
    group: 'Viewport',
    description: 'Pan',
    display: 'Right-drag or middle-drag',
  },
  {
    id: 'orbit-pan-modifier',
    kind: 'gesture',
    group: 'Viewport',
    description: 'Pan with a single-button trackpad',
    display: 'Space or Shift + drag',
  },
  {
    id: 'orbit-zoom',
    kind: 'gesture',
    group: 'Viewport',
    description: 'Zoom',
    display: 'Scroll',
  },
  {
    id: 'fly-move',
    kind: 'gesture',
    group: 'Viewport',
    description: 'Move (fly mode)',
    display: 'W A S D',
  },
  {
    id: 'fly-vertical',
    kind: 'gesture',
    group: 'Viewport',
    description: 'Up / down (fly mode)',
    display: 'Q / E — R / F also work',
  },
  {
    id: 'fly-look',
    kind: 'gesture',
    group: 'Viewport',
    description: 'Look (fly mode)',
    display: 'Drag',
  },
  {
    id: 'fly-dolly',
    kind: 'gesture',
    group: 'Viewport',
    description: 'Move forward / back (fly mode)',
    display: 'Scroll',
  },
]
