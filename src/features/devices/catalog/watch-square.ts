import type { DeviceSpec } from '../spec/types'

/** Rounded-square smartwatch with a digital crown and a fluoro strap. */
export const watchSquare: DeviceSpec = {
  id: 'watch-square',
  name: 'Watch 45mm',
  category: 'Watches',
  kind: 'watch',
  icon: 'watch',
  mesh: { kind: 'procedural' },

  body: {
    width: 38,
    height: 45,
    depth: 10.7,
    cornerRadius: 11.5,
    cornerSmoothing: 4.8,
    edgeRadius: 2.6,
  },
  screen: { inset: 2.6, cornerRadius: 9.5 },
  screenAspect: 38 / 45,
  cutout: { type: 'none' },

  // Digital crown and side button.
  buttons: [
    { side: 'right', offset: 7, length: 6, protrusion: 1.4, width: 5.4 },
    { side: 'right', offset: -6, length: 10, protrusion: 0.7, width: 3.6 },
  ],

  band: {
    width: 26,
    thickness: 3.4,
    length: 62,
    curve: 34,
    material: 'soft-plastic',
  },

  materials: { frame: 'aluminium', back: 'ceramic' },
  colorways: [
    { id: 'midnight', label: 'Midnight', body: '#2b2e36', frame: '#3a3e47' },
    { id: 'starlight', label: 'Starlight', body: '#e6e0d4', frame: '#d1cbc0' },
    { id: 'titanium', label: 'Titanium', body: '#a6a29b', frame: '#8f8b84' },
  ],
  supportedOverlays: [],
}
