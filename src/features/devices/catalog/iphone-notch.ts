import type { DeviceSpec } from '../spec/types'

/** Previous-generation phone: aluminium rails, glossy back, notch cutout. */
export const iphoneNotch: DeviceSpec = {
  id: 'iphone-notch',
  name: 'Phone 6.1" (notch)',
  category: 'Phones',
  kind: 'phone',
  icon: 'phone',
  mesh: { kind: 'procedural' },

  body: {
    width: 71.5,
    height: 146.7,
    depth: 7.65,
    cornerRadius: 11.4,
    cornerSmoothing: 4.6,
    edgeRadius: 1.2,
  },
  screen: { inset: 2.4, cornerRadius: 9.2 },
  screenAspect: 19.5 / 9,
  cutout: { type: 'notch', width: 34.8, height: 6.4 },

  cameraBump: {
    x: -17.5,
    y: 49.5,
    width: 30,
    height: 30,
    depth: 1.9,
    cornerRadius: 9,
    lenses: [
      { x: -6.5, y: 6.5, radius: 6.2 },
      { x: 6.5, y: -6.5, radius: 6.2 },
    ],
  },

  buttons: [
    { side: 'left', offset: 36, length: 12, protrusion: 0.5 },
    { side: 'left', offset: 22, length: 12, protrusion: 0.5 },
    { side: 'right', offset: 34, length: 20, protrusion: 0.5 },
  ],

  edges: [
    { side: 'bottom', offset: 0, length: 8.7, across: 3.2, kind: 'slot' },
    { side: 'bottom', offset: -19, length: 13, kind: 'grille', count: 5 },
    { side: 'bottom', offset: 19, length: 13, kind: 'grille', count: 5 },
    { side: 'top', offset: 12, length: 1.4, kind: 'hole' },
  ],

  magsafe: { radius: 27, band: 4.5, y: -6 },
  materials: { frame: 'aluminium', back: 'gloss-glass' },
  colorways: [
    { id: 'midnight', label: 'Midnight', body: '#25282d', frame: '#33373d' },
    { id: 'starlight', label: 'Starlight', body: '#e9e3d8', frame: '#d5cfc4' },
    { id: 'product-red', label: 'Red', body: '#a52b32', frame: '#b83a40' },
  ],
  supportedOverlays: ['status-bar-ios', 'gesture-bar'],
}
