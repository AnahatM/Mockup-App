import type { DeviceSpec } from '../spec/types'

/** Generic Android flagship: punch-hole camera, aluminium rails, glass back. */
export const androidFlagship: DeviceSpec = {
  id: 'android-flagship',
  name: 'Android Flagship',
  category: 'Phones',
  kind: 'phone',
  icon: 'phone',
  mesh: { kind: 'procedural' },

  body: {
    width: 70.9,
    height: 147.5,
    depth: 7.6,
    cornerRadius: 8.4,
    cornerSmoothing: 3.6,
    edgeRadius: 1.1,
  },

  screen: {
    inset: 1.7,
    cornerRadius: 7,
  },
  screenAspect: 19.5 / 9,

  cutout: { type: 'punch-hole', diameter: 4.4, top: 4.2 },

  cameraBump: {
    x: -16.2,
    y: 46.5,
    width: 27.5,
    height: 40,
    depth: 2.1,
    cornerRadius: 9,
    lenses: [
      { x: 0, y: 12, radius: 6.2 },
      { x: 0, y: 0, radius: 6.2 },
      { x: 0, y: -12, radius: 5.4 },
    ],
    flash: { x: 10.2, y: 12, radius: 2.2 },
  },

  buttons: [
    { side: 'right', offset: 36, length: 22, protrusion: 0.5 },
    { side: 'right', offset: 16, length: 11, protrusion: 0.5 },
  ],

  edges: [
    { side: 'bottom', offset: 0, length: 8.7, across: 3.2, kind: 'slot' },
    { side: 'bottom', offset: -19, length: 13, kind: 'grille', count: 5 },
    { side: 'bottom', offset: 19, length: 13, kind: 'grille', count: 5 },
    { side: 'top', offset: 12, length: 1.4, kind: 'hole' },
  ],
  materials: { frame: 'aluminium', back: 'gloss-glass' },

  colorways: [
    { id: 'obsidian', label: 'Obsidian', body: '#232427', frame: '#3a3c41' },
    { id: 'porcelain', label: 'Porcelain', body: '#e6e2d9', frame: '#c9c5bc' },
    { id: 'bay', label: 'Bay blue', body: '#4a6a94', frame: '#6b86a8' },
    { id: 'aloe', label: 'Aloe', body: '#5e7a5c', frame: '#7d9479' },
  ],

  supportedOverlays: ['status-bar-android', 'nav-bar-android', 'gesture-bar'],
}
