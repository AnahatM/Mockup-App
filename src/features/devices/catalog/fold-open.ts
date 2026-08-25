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
    width: 132.6,
    height: 153.5,
    depth: 5.6,
    cornerRadius: 8,
    cornerSmoothing: 3.6,
    edgeRadius: 0.9,
  },
  screen: { inset: 2.2, cornerRadius: 6.5 },
  screenAspect: 2160 / 1856,
  cutout: { type: 'punch-hole', diameter: 4, top: 4, offsetX: 40 },

  buttons: [{ side: 'right', offset: 34, length: 26, protrusion: 0.45 }],

  crease: { axis: 'x', width: 3.2 },
  edges: [
    { side: 'bottom', offset: 0, length: 8.7, across: 3.2, kind: 'slot' },
    { side: 'bottom', offset: 40, length: 14, kind: 'grille', count: 5 },
  ],
  materials: { frame: 'aluminium', back: 'matte-glass' },
  colorways: [
    { id: 'phantom-black', label: 'Phantom black', body: '#2b2c31', frame: '#3a3c42' },
    { id: 'silver-shadow', label: 'Silver shadow', body: '#c7c9cc', frame: '#b0b2b6' },
  ],
  supportedOverlays: ['status-bar-android', 'gesture-bar', 'nav-bar-android'],
}
