import type { DeviceSpec } from '../spec/types'

/**
 * Round smartwatch. A circle is just a squircle whose corner radius is half its
 * width at exponent 2, so no special-case geometry is needed.
 */
export const watchRound: DeviceSpec = {
  id: 'watch-round',
  name: 'Watch (round) 46mm',
  category: 'Watches',
  kind: 'watch',
  icon: 'watch',
  mesh: { kind: 'procedural' },

  body: {
    width: 46,
    height: 46,
    depth: 10.9,
    cornerRadius: 23,
    cornerSmoothing: 2,
    edgeRadius: 2.2,
  },
  screen: { inset: 3.2, cornerRadius: 19.8 },
  screenAspect: 1,
  cutout: { type: 'none' },

  buttons: [
    { side: 'right', offset: 8, length: 7, protrusion: 1.3, width: 5 },
    { side: 'right', offset: -8, length: 7, protrusion: 1.1, width: 5 },
  ],

  band: {
    width: 22,
    thickness: 3.2,
    length: 60,
    curve: 32,
    material: 'soft-plastic',
  },

  materials: { frame: 'steel', back: 'ceramic' },
  colorways: [
    { id: 'black', label: 'Black', body: '#26282c', frame: '#3a3d42' },
    { id: 'silver', label: 'Silver', body: '#c8cacd', frame: '#aeb0b4' },
    { id: 'gold', label: 'Gold', body: '#c2a878', frame: '#a98f60' },
  ],
  supportedOverlays: [],
}
