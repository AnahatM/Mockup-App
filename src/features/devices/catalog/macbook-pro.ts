import type { DeviceSpec } from '../spec/types'

/** 14" pro laptop: aluminium unibody, notched display, backlit deck. */
export const macbookPro: DeviceSpec = {
  id: 'macbook-pro',
  name: 'Pro Laptop 14"',
  category: 'Laptops',
  kind: 'laptop',
  icon: 'laptop',
  mesh: { kind: 'procedural' },

  // The lid.
  body: {
    width: 312.6,
    height: 221.2,
    depth: 6.2,
    cornerRadius: 8,
    cornerSmoothing: 3.4,
    edgeRadius: 0.9,
  },

  screen: {
    inset: 5.6,
    insetBottom: 8.4,
    cornerRadius: 5,
  },
  screenAspect: 16 / 10,

  cutout: { type: 'notch', width: 68, height: 7.2 },

  buttons: [],

  hinge: {
    defaultAngle: 104,
    minAngle: 0,
    maxAngle: 130,
    base: {
      width: 312.6,
      height: 221.2,
      depth: 9.3,
      cornerRadius: 8,
      cornerSmoothing: 3.4,
      edgeRadius: 0.9,
    },
    keyboard: { width: 278, height: 106, y: 46 },
    trackpad: { width: 160, height: 100, y: -51 },
  },

  materials: { frame: 'aluminium', back: 'aluminium' },

  colorways: [
    { id: 'space-black', label: 'Space black', body: '#37383c', frame: '#42434a' },
    { id: 'silver', label: 'Silver', body: '#d8d9db', frame: '#c3c5c8' },
    { id: 'midnight', label: 'Midnight', body: '#2e3a4a', frame: '#3b4959' },
  ],

  supportedOverlays: ['menu-bar', 'dock'],
}
