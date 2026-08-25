import type { DeviceSpec } from '../spec/types'

/**
 * Folding flip phone, unfolded. A tall slab with a punch-hole camera — which is
 * exactly what an unfolded flip is, since the fold runs across the display.
 */
export const flipOpen: DeviceSpec = {
  id: 'flip-open',
  name: 'Flip (open)',
  category: 'Folding',
  kind: 'phone',
  icon: 'phone',
  mesh: { kind: 'procedural' },

  body: {
    width: 71.9,
    height: 165.1,
    depth: 6.9,
    cornerRadius: 9.5,
    cornerSmoothing: 3.8,
    edgeRadius: 1,
  },
  screen: { inset: 3.7, cornerRadius: 8 },
  screenAspect: 2640 / 1080,
  cutout: { type: 'punch-hole', diameter: 4.2, top: 4 },

  buttons: [
    { side: 'right', offset: 30, length: 24, protrusion: 0.45 },
    { side: 'right', offset: 8, length: 10, protrusion: 0.45 },
  ],

  materials: { frame: 'aluminium', back: 'matte-glass' },
  colorways: [
    { id: 'graphite', label: 'Graphite', body: '#33343a', frame: '#43454c' },
    { id: 'mint', label: 'Mint', body: '#9fc0ab', frame: '#b3cfbc' },
    { id: 'lavender', label: 'Lavender', body: '#a99ac4', frame: '#bcb0d3' },
  ],
  supportedOverlays: ['status-bar-android', 'gesture-bar', 'nav-bar-android'],
}
