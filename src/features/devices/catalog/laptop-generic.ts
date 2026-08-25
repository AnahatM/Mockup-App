import type { DeviceSpec } from '../spec/types'

/** Generic 15.6" 16:9 laptop with conventional bezels. */
export const laptopGeneric: DeviceSpec = {
  id: 'laptop-generic',
  name: 'Laptop 15.6"',
  category: 'Laptops',
  kind: 'laptop',
  icon: 'laptop',
  mesh: { kind: 'procedural' },

  body: {
    width: 358,
    height: 235,
    depth: 6.4,
    cornerRadius: 5,
    cornerSmoothing: 3,
    edgeRadius: 0.7,
  },
  screen: { inset: 6.7, insetTop: 8, insetBottom: 33.2, cornerRadius: 2.5 },
  screenAspect: 16 / 9,
  cutout: { type: 'none' },
  buttons: [],

  hinge: {
    defaultAngle: 102,
    minAngle: 0,
    maxAngle: 135,
    base: {
      width: 358,
      height: 235,
      depth: 11.5,
      cornerRadius: 5,
      cornerSmoothing: 3,
      edgeRadius: 0.7,
    },
    keyboard: { width: 312, height: 119, y: 46 },
    trackpad: { width: 120, height: 74, y: -70 },
    feet: { width: 40, depth: 10, height: 2.2, inset: 16 },
  },

  materials: { frame: 'aluminium', back: 'soft-plastic' },
  colorways: [
    { id: 'slate', label: 'Slate', body: '#4a4d52', frame: '#5a5d63' },
    { id: 'graphite', label: 'Graphite', body: '#2f3135', frame: '#3d4045' },
    { id: 'platinum', label: 'Platinum', body: '#cfd1d4', frame: '#bcbec2' },
  ],
  supportedOverlays: ['menu-bar', 'dock'],
}
