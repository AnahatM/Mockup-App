# Device specs

> **Status: pending.** The `DeviceSpec` type and the procedural builders land in **P3** of
> [`PLAN.md`](PLAN.md). This document will describe the full field reference and a
> step-by-step walkthrough for adding a device once that system exists.

## The shape of the idea

A device is a data file, not a model. It declares its dimensions, its screen geometry, which
physical details it has, and which screen overlays make sense for it:

```ts
export const iphonePro: DeviceSpec = {
  id: 'iphone-pro',
  name: 'iPhone Pro',
  kind: 'phone',
  mesh: { kind: 'procedural' },
  body: { width: 70.6, height: 146.6, depth: 8.25, cornerRadius: 12 },
  screen: { inset: 2.1, cornerRadius: 10 },
  cutout: { type: 'dynamic-island', width: 25, height: 8 },
  cameras: [/* lens positions and radii */],
  buttons: [/* side button placements */],
  materials: { frame: 'titanium', back: 'matte-glass' },
  supportedOverlays: ['status-bar-ios', 'gesture-bar'],
}
```

Dimensions are in millimetres so specs can be taken directly from published measurements.

Any device can opt out of procedural generation via
`mesh: { kind: 'glb', url, screenMesh }` — see
[`adr/0001-procedural-geometry.md`](adr/0001-procedural-geometry.md).
