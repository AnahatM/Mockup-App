Devices are data, so adding one to the catalogue permanently is usually a single file — no 3D modelling required. This page is for people contributing to the project.

## What a device is

A description of real dimensions and features:

```ts
export const myPhone: DeviceSpec = {
  id: 'my-phone',
  name: 'My Phone',
  category: 'Phones',
  kind: 'phone',
  icon: 'phone',
  mesh: { kind: 'procedural' },

  body: {
    width: 70.6, height: 146.6, depth: 8.25,
    cornerRadius: 11.8,
    cornerSmoothing: 4.6,
    edgeRadius: 1.5,
  },

  screen: { inset: 2.1, cornerRadius: 9.7 },
  cutout: { type: 'island', width: 25.1, height: 8.1, top: 3.6 },

  buttons: [
    { side: 'left', offset: 38.3, length: 12.4 },
    { side: 'right', offset: 35.3, length: 21.6 },
  ],

  materials: { frame: 'titanium', back: 'matte-glass' },
  colorways: [{ id: 'graphite', label: 'Graphite', body: '#3a3a3d' }],
  supportedOverlays: ['status-bar-ios', 'gesture-bar'],
}
```

All dimensions are millimetres, so they can be copied straight from published measurements.

## The two fields that matter most

**`cornerSmoothing`** is the superellipse exponent. At 2 you get a plain circular arc; at 4–5 you get the continuous-curvature corner that makes a device read as real hardware rather than a rounded box.

**`edgeRadius`** is the chamfer on the front and back edges. Do not set it to zero — a flat-sided slab has no curvature at its edges, catches no rim light, and looks like a cardboard cutout.

## Other parts

`cameraBump` places a plateau with real lenses. `hinge` turns the device into a clamshell, with `body` becoming the lid. `stand` adds a neck and foot for a desktop display. `band` sweeps a watch strap along a curve.

`supportedOverlays` decides which screen furniture is offered, so a phone is never shown a macOS dock.

## Framing

Do not hand-tune the camera. Camera distance, plinth radius and shadow extent are all derived from the device's own bounding size, so a new device arrives correctly composed.

Full field reference is in `docs/device-specs.md` in the repository.
