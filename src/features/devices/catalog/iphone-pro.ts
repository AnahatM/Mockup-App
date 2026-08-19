import type { DeviceSpec } from '../spec/types'

/**
 * Flagship titanium phone with a pill-shaped cutout.
 *
 * Dimensions follow published measurements for a 6.1" pro-class handset. An
 * original procedural approximation — see the licence note in README.
 */
export const iphonePro: DeviceSpec = {
  id: 'iphone-pro',
  name: 'Pro Phone 6.1"',
  category: 'Phones',
  kind: 'phone',
  icon: 'phone',
  mesh: { kind: 'procedural' },

  body: {
    width: 70.6,
    height: 146.6,
    depth: 8.25,
    cornerRadius: 11.8,
    cornerSmoothing: 4.6,
    edgeRadius: 1.5,
  },

  screen: {
    inset: 2.1,
    cornerRadius: 9.7,
  },
  screenAspect: 19.5 / 9,

  cutout: { type: 'island', width: 25.1, height: 8.1, top: 3.6 },

  cameraBump: {
    x: -15.4,
    y: 47.6,
    width: 37.2,
    height: 37.2,
    depth: 2.4,
    cornerRadius: 11.5,
    lenses: [
      { x: -8.6, y: 8.6, radius: 7.4 },
      { x: 8.6, y: 8.6, radius: 7.4 },
      { x: -8.6, y: -8.6, radius: 7.4 },
    ],
    flash: { x: 9.4, y: -8.6, radius: 3.1 },
  },

  buttons: [
    // Action button, volume up, volume down.
    { side: 'left', offset: 53.3, length: 6.6, protrusion: 0.55 },
    { side: 'left', offset: 38.3, length: 12.4, protrusion: 0.55 },
    { side: 'left', offset: 24.3, length: 12.4, protrusion: 0.55 },
    // Power.
    { side: 'right', offset: 35.3, length: 21.6, protrusion: 0.55 },
  ],

  materials: { frame: 'titanium', back: 'matte-glass' },

  colorways: [
    {
      id: 'black-titanium',
      label: 'Black titanium',
      body: '#3a3a3d',
      frame: '#4a4a4f',
    },
    {
      id: 'natural-titanium',
      label: 'Natural titanium',
      body: '#c3bdb3',
      frame: '#a09a91',
    },
    { id: 'blue-titanium', label: 'Blue titanium', body: '#4c5866', frame: '#5d6a78' },
    {
      id: 'white-titanium',
      label: 'White titanium',
      body: '#e9e7e2',
      frame: '#cdcac4',
    },
  ],

  supportedOverlays: ['status-bar-ios', 'gesture-bar'],
}
