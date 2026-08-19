import type { DeviceSpec } from '../spec/types'

/** Compact 8.3" tablet. */
export const tabletMini: DeviceSpec = {
  id: 'tablet-mini',
  name: 'Tablet Mini 8.3"',
  category: 'Tablets',
  kind: 'tablet',
  icon: 'tablet',
  mesh: { kind: 'procedural' },

  body: {
    width: 134.8,
    height: 195.4,
    depth: 6.3,
    cornerRadius: 15,
    cornerSmoothing: 4.4,
    edgeRadius: 1.1,
  },
  screen: { inset: 7.5, cornerRadius: 10 },
  screenAspect: 3 / 2,
  cutout: { type: 'none' },

  cameraBump: {
    x: -50,
    y: 76,
    width: 18,
    height: 18,
    depth: 1.2,
    cornerRadius: 6,
    lenses: [{ x: 0, y: 0, radius: 5.6 }],
  },

  buttons: [
    { side: 'top', offset: 40, length: 11, protrusion: 0.4 },
    { side: 'top', offset: -34, length: 20, protrusion: 0.4 },
  ],

  materials: { frame: 'aluminium', back: 'aluminium' },
  colorways: [
    { id: 'starlight', label: 'Starlight', body: '#e4ded2', frame: '#cec9be' },
    { id: 'purple', label: 'Purple', body: '#9a93bd', frame: '#a8a1c8' },
    { id: 'space-grey', label: 'Space grey', body: '#5c5e63', frame: '#6a6c72' },
  ],
  supportedOverlays: ['status-bar-ios', 'gesture-bar'],
}
