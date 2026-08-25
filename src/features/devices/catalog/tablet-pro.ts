import type { DeviceSpec } from '../spec/types'

/** 13" pro tablet: thin uniform bezels, single rear camera. */
export const tabletPro: DeviceSpec = {
  id: 'tablet-pro',
  name: 'Tablet Pro 13"',
  category: 'Tablets',
  kind: 'tablet',
  icon: 'tablet',
  mesh: { kind: 'procedural' },

  body: {
    width: 215.5,
    height: 281.6,
    depth: 5.1,
    cornerRadius: 18,
    cornerSmoothing: 4.4,
    edgeRadius: 1.1,
  },
  screen: { inset: 8.5, cornerRadius: 12 },
  screenAspect: 4 / 3,
  cutout: { type: 'none' },

  cameraBump: {
    x: -84,
    y: 112,
    width: 22,
    height: 22,
    depth: 1.3,
    cornerRadius: 7,
    lenses: [{ x: 0, y: 0, radius: 7 }],
  },

  buttons: [
    { side: 'top', offset: 62, length: 12, protrusion: 0.4 },
    { side: 'left', offset: 108, length: 22, protrusion: 0.4 },
  ],

  edges: [
    { side: 'bottom', offset: 0, length: 8.7, across: 3.2, kind: 'slot' },
    { side: 'bottom', offset: -42, length: 18, kind: 'grille', count: 6 },
    { side: 'bottom', offset: 42, length: 18, kind: 'grille', count: 6 },
  ],
  materials: { frame: 'aluminium', back: 'aluminium' },
  colorways: [
    { id: 'space-black', label: 'Space black', body: '#3a3b40', frame: '#45464c' },
    { id: 'silver', label: 'Silver', body: '#d6d8db', frame: '#c2c4c8' },
  ],
  supportedOverlays: ['status-bar-ios', 'gesture-bar'],
}
