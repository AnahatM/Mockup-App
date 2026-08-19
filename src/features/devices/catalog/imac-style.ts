import type { DeviceSpec } from '../spec/types'

/** All-in-one desktop: a thin display on a slim aluminium neck and foot. */
export const imacStyle: DeviceSpec = {
  id: 'imac-style',
  name: 'All-in-one 24"',
  category: 'Desktops',
  kind: 'desktop',
  icon: 'monitor',
  mesh: { kind: 'procedural' },

  body: {
    width: 547,
    height: 461,
    depth: 11.5,
    cornerRadius: 12,
    cornerSmoothing: 4,
    edgeRadius: 1.4,
  },
  // A deep chin below the display, as this form factor has.
  screen: { inset: 12, insetBottom: 62, cornerRadius: 6 },
  screenAspect: 16 / 9,
  cutout: { type: 'none' },
  buttons: [],

  stand: {
    neckWidth: 130,
    neckDepth: 12,
    neckHeight: 110,
    baseWidth: 300,
    baseDepth: 160,
    baseHeight: 9,
  },

  materials: { frame: 'aluminium', back: 'aluminium' },
  colorways: [
    { id: 'silver', label: 'Silver', body: '#dcdee1', frame: '#c6c8cc' },
    { id: 'blue', label: 'Blue', body: '#4f7fa8', frame: '#6d9ac0' },
    { id: 'green', label: 'Green', body: '#5c8a6a', frame: '#77a382' },
  ],
  supportedOverlays: ['menu-bar', 'dock'],
}
