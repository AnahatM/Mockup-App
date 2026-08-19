import type { DeviceSpec } from '../spec/types'

/** Standalone 27" desktop monitor on a stand. */
export const monitor27: DeviceSpec = {
  id: 'monitor-27',
  name: 'Monitor 27"',
  category: 'Desktops',
  kind: 'desktop',
  icon: 'monitor',
  mesh: { kind: 'procedural' },

  body: {
    width: 614,
    height: 366,
    depth: 17,
    cornerRadius: 6,
    cornerSmoothing: 3.2,
    edgeRadius: 1.2,
  },
  screen: { inset: 9, insetBottom: 16, cornerRadius: 3 },
  screenAspect: 16 / 9,
  cutout: { type: 'none' },
  buttons: [],

  stand: {
    neckWidth: 90,
    neckDepth: 30,
    neckHeight: 140,
    baseWidth: 240,
    baseDepth: 190,
    baseHeight: 12,
  },

  materials: { frame: 'aluminium', back: 'soft-plastic' },
  colorways: [
    { id: 'graphite', label: 'Graphite', body: '#303236', frame: '#3f4247' },
    { id: 'silver', label: 'Silver', body: '#c9cbcf', frame: '#b4b6ba' },
  ],
  supportedOverlays: ['menu-bar', 'dock'],
}
