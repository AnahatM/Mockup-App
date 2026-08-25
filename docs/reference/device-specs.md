# Adding a device

A device is **data, not a model**. Adding one is normally a single file plus one
line in the registry — no geometry code, no assets.

## 1. Write the spec

Create `src/features/devices/catalog/<your-device>.ts`:

```ts
import type { DeviceSpec } from '../spec/types'

export const myPhone: DeviceSpec = {
  id: 'my-phone',
  name: 'My Phone',
  category: 'Phones', // groups it in the device rail
  kind: 'phone',
  icon: 'phone',
  mesh: { kind: 'procedural' },

  body: {
    width: 70.6,
    height: 146.6,
    depth: 8.25,
    cornerRadius: 11.8,
    cornerSmoothing: 4.6, // 2 = circular arc, 4-5 = continuous corner
    edgeRadius: 1.5, // the chamfer that catches the rim light
  },

  screen: { inset: 2.1, cornerRadius: 9.7 },
  cutout: { type: 'island', width: 25.1, height: 8.1, top: 3.6 },

  buttons: [
    { side: 'left', offset: 38.3, length: 12.4, protrusion: 0.55 },
    { side: 'right', offset: 35.3, length: 21.6, protrusion: 0.55 },
  ],

  materials: { frame: 'titanium', back: 'matte-glass' },
  colorways: [{ id: 'graphite', label: 'Graphite', body: '#3a3a3d', frame: '#4a4a4f' }],
  supportedOverlays: ['status-bar-ios', 'gesture-bar'],
}
```

## 2. Register it

Add it to `DEVICES` in `src/features/devices/spec/registry.ts`. That is the whole
change — the rail, the picker, the camera framing and the pedestal all read from
there.

---

## Field reference

**All dimensions are in millimetres**, so you can copy them straight from
published measurements. The renderer converts once via `MM_TO_UNITS` (1 scene
unit = 100mm).

### `body`

| Field                        | Meaning                                                                                                                                                                                 |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `width` / `height` / `depth` | Outer dimensions                                                                                                                                                                        |
| `cornerRadius`               | Corner radius, clamped to half the shorter side                                                                                                                                         |
| `cornerSmoothing`            | Superellipse exponent. **2** is a plain circular arc; **4-5** gives the continuous-curvature corner that makes a device read as real hardware rather than as a rounded box. Default 4.4 |
| `edgeRadius`                 | Chamfer on the front and back edges. Do not set this to 0 — a flat-sided slab has no curvature at its edges, so it catches no rim light and looks like a cardboard cutout               |

### `screen`

`inset` is the bezel on the sides and the top. `insetTop` overrides the top for
anything with a camera up there (laptops, all-in-ones — their top bezel is about
twice the side), and `insetBottom` overrides the chin. `cornerRadius` is usually
a little smaller than the body's.

**Derive the bezels from the display, do not eyeball them.** The body size and
the display's resolution are both published; the bezel is whatever is left over.
`spec/screenAspect.test.ts` enforces it, comparing `screenAspect` against the
rectangle the insets actually leave and failing if they drift more than three
percent apart.

That test is the catalogue's only real cross-check. Every other number in a spec
is plausible on its own — a body 10mm too wide still renders a phone — and the
aspect ratio is the one figure quoted separately that can therefore contradict
the rest. It caught three genuine errors on the day it was written, including a
folding phone eight percent too wide and an all-in-one built to Apple's
published height, which turns out to include the stand.

### `cutout`

`{ type: 'none' }`, `{ type: 'notch', width, height }`,
`{ type: 'island', width, height, top }`, or
`{ type: 'punch-hole', diameter, top, offsetX? }`.

`top` is measured from the top edge of the _screen_, not the body.

### `buttons`

`offset` is the distance from the body centre along the rail, positive upward.
Buttons are built as chamfered pills in the frame material — they read as buttons
because their chamfer catches its own highlight, not because they differ in colour.

### `cameraBump`

`x` / `y` position the plateau on the back face relative to the body centre.
Each lens is `{ x, y, radius }` relative to the _bump_ centre, and is rendered as
a metal ring, a recessed barrel and a glass cap.

### `hinge` — laptops and folding phones

Supplying `hinge` switches the device to the clamshell renderer. `body` becomes
the lid and `hinge.base` is the bottom half.

`defaultAngle` is measured from closed: **0** is shut, **90** is upright, and
anything above leans back. `keyboard` and `trackpad` are optional deck features,
positioned by `y` relative to the base centre.

### `materials`

`frame` is the side band, `back` is the front and back faces. Available finishes
are in `materials/finishes.ts`: `titanium`, `aluminium`, `steel`, `matte-glass`,
`gloss-glass`, `ceramic`, `soft-plastic`.

The body is one mesh with two material groups — `ExtrudeGeometry` emits the flat
caps and the side walls separately, which maps exactly onto glass-back /
metal-band construction. Doing this with materials rather than a second mesh
avoids coincident surfaces z-fighting along the rail, which is precisely where
the eye is drawn by the rim highlight.

### `supportedOverlays`

Which screen overlays the device panel offers. A phone should not be offered a
macOS dock, and a laptop should not be offered a gesture bar.

---

## Using a real 3D model instead

Any device can opt out of procedural geometry:

```ts
mesh: { kind: 'glb', url: '/models/my-phone.glb', screenMesh: 'Screen_01' }
```

Nothing else in the spec changes. Screen overlays keep working, because they are
texture layers rather than geometry. See
[`adr/0001-procedural-geometry.md`](../adr/0001-procedural-geometry.md) for why
procedural is the default.

## Sizing and framing

Do not hand-tune the camera for a new device. `spec/framing.ts` derives the
camera distance and the pedestal radius from the device's own bounding size, so a
150mm phone and a 310mm laptop are both correctly composed on arrival.

## A note on trademarks

Devices in this repo are **original procedural approximations**. Please do not
contribute geometry or textures copied from a manufacturer's assets, and keep
brand references to describing the form factor.
