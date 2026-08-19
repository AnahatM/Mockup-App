import { mix } from '@/lib/color/hex'

/**
 * A free paint palette for device bodies.
 *
 * Separate from a device's factory `colorways`: those are the real finishes a
 * device ships in, this is "make it any colour you like". Both are offered,
 * because a mockup sometimes wants an accurate product and sometimes wants to
 * match a brand.
 */
export interface PaintColor {
  id: string
  label: string
  body: string
}

export const PAINT_COLORS: readonly PaintColor[] = [
  { id: 'red', label: 'Red', body: '#f4453c' },
  { id: 'crimson', label: 'Crimson', body: '#e4175c' },
  { id: 'white', label: 'White', body: '#f4f3ee' },
  { id: 'violet', label: 'Violet', body: '#7b3fd4' },
  { id: 'indigo', label: 'Indigo', body: '#3f47c4' },

  { id: 'blue', label: 'Blue', body: '#2c8ef0' },
  { id: 'sky', label: 'Sky', body: '#12a7f0' },
  { id: 'cyan', label: 'Cyan', body: '#17c2d4' },
  { id: 'teal', label: 'Teal', body: '#0e9184' },
  { id: 'green', label: 'Green', body: '#3fae52' },

  { id: 'lime', label: 'Lime', body: '#82c341' },
  { id: 'chartreuse', label: 'Chartreuse', body: '#c3d63c' },
  { id: 'yellow', label: 'Yellow', body: '#f7e04a' },
  { id: 'amber', label: 'Amber', body: '#fbbe14' },
  { id: 'orange', label: 'Orange', body: '#fb9214' },

  { id: 'tangerine', label: 'Tangerine', body: '#fa5c22' },
  { id: 'brown', label: 'Brown', body: '#8a5a44' },
  { id: 'slate', label: 'Slate', body: '#5f7480' },
  { id: 'graphite', label: 'Graphite', body: '#3a3a3d' },
  { id: 'black', label: 'Black', body: '#1b1c1f' },
]

/**
 * Derives a rail colour from a body colour.
 *
 * A real device's metal band is the same hue as its back but lighter and less
 * saturated, because brushed metal scatters more than glass. Lifting the body
 * colour toward white reproduces that without asking the user for a second
 * colour — and dark bodies get a proportionally bigger lift, since a black
 * phone still has a visibly metallic rail.
 */
export function railColorFor(body: string): string {
  return mix(body, '#ffffff', 0.22)
}
