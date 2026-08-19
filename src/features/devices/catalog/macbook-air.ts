import type { DeviceSpec } from '../spec/types'

/** 13" thin-and-light clamshell. */
export const macbookAir: DeviceSpec = {
  id: 'macbook-air',
  name: 'Air Laptop 13"',
  category: 'Laptops',
  kind: 'laptop',
  icon: 'laptop',
  mesh: { kind: 'procedural' },

  body: {
    width: 304.1,
    height: 215,
    depth: 5.4,
    cornerRadius: 7,
    cornerSmoothing: 3.4,
    edgeRadius: 0.8,
  },
  screen: { inset: 5.2, insetBottom: 7.8, cornerRadius: 4.5 },
  screenAspect: 16 / 10,
  cutout: { type: 'notch', width: 62, height: 6.6 },
  buttons: [],

  hinge: {
    defaultAngle: 106,
    minAngle: 0,
    maxAngle: 130,
    base: {
      width: 304.1,
      height: 215,
      depth: 8.2,
      cornerRadius: 7,
      cornerSmoothing: 3.4,
      edgeRadius: 0.8,
    },
    keyboard: { width: 268, height: 104, y: 38 },
    trackpad: { width: 150, height: 94, y: -60 },
  },

  materials: { frame: 'aluminium', back: 'aluminium' },
  colorways: [
    { id: 'midnight', label: 'Midnight', body: '#2c3440', frame: '#39424f' },
    { id: 'starlight', label: 'Starlight', body: '#e8e1d4', frame: '#d3ccbf' },
    { id: 'space-grey', label: 'Space grey', body: '#585a5f', frame: '#66686d' },
  ],
  supportedOverlays: ['menu-bar', 'dock'],
}
