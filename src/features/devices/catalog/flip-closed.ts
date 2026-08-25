import type { DeviceSpec } from '../spec/types'

/** Folding flip phone, closed: a compact square with the cover display. */
export const flipClosed: DeviceSpec = {
  id: 'flip-closed',
  name: 'Flip (closed)',
  category: 'Folding',
  kind: 'phone',
  icon: 'phone',
  mesh: { kind: 'procedural' },

  body: {
    width: 71.9,
    height: 85.1,
    // Folded, so roughly twice the open thickness plus the hinge gap.
    depth: 15.1,
    cornerRadius: 9.5,
    cornerSmoothing: 3.8,
    edgeRadius: 1.2,
  },
  // The cover display occupies most of the front, beside the cameras.
  screen: { inset: 4.5, insetBottom: 15.3, cornerRadius: 7 },
  screenAspect: 748 / 720,
  cutout: { type: 'none' },

  cameraBump: {
    x: 0,
    y: -30,
    width: 46,
    height: 22,
    depth: 0.9,
    cornerRadius: 10,
    lenses: [
      { x: -11, y: 0, radius: 7 },
      { x: 11, y: 0, radius: 7 },
    ],
  },

  buttons: [{ side: 'right', offset: 12, length: 26, protrusion: 0.45 }],

  materials: { frame: 'aluminium', back: 'matte-glass' },
  colorways: [
    { id: 'graphite', label: 'Graphite', body: '#33343a', frame: '#43454c' },
    { id: 'mint', label: 'Mint', body: '#9fc0ab', frame: '#b3cfbc' },
    { id: 'cream', label: 'Cream', body: '#e6ded0', frame: '#cfc7ba' },
  ],
  supportedOverlays: ['status-bar-android'],
}
