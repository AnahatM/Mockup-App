import type { DeviceSpec } from '../spec/types'

/** Book-style foldable, opened flat: a small near-square tablet. */
export const foldOpen: DeviceSpec = {
  id: 'fold-open',
  name: 'Fold (open)',
  category: 'Folding',
  kind: 'tablet',
  icon: 'tablet',
  mesh: { kind: 'procedural' },

  body: {
    width: 142.9,
    height: 153.5,
    depth: 5.6,
    cornerRadius: 8,
    cornerSmoothing: 3.6,
    edgeRadius: 0.9,
  },
  screen: { inset: 2.2, cornerRadius: 6.5 },
  screenAspect: 6 / 5,
  cutout: { type: 'punch-hole', diameter: 4, top: 4, offsetX: 40 },

  buttons: [{ side: 'right', offset: 34, length: 26, protrusion: 0.45 }],

  materials: { frame: 'aluminium', back: 'matte-glass' },
  colorways: [
    { id: 'phantom-black', label: 'Phantom black', body: '#2b2c31', frame: '#3a3c42' },
    { id: 'silver-shadow', label: 'Silver shadow', body: '#c7c9cc', frame: '#b0b2b6' },
  ],
  supportedOverlays: ['status-bar-android', 'gesture-bar', 'nav-bar-android'],
}
