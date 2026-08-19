# ADR 0001 — Procedural device geometry, with a GLB escape hatch

**Status:** Accepted
**Date:** 2026-08-19

## Context

Device models can either be generated in code from a parametric spec, or shipped as
hand-modelled GLB/GLTF assets. This is the single largest architectural fork in the project:
it determines repo size, whether devices can be recoloured, whether the app can run without
a network, and what legal exposure a public repo carries.

## Decision

Build devices **procedurally** from a `DeviceSpec` data file, and ship a
`DeviceMeshSource` discriminated union from day one so any device can later be swapped to a
real model without a refactor:

```ts
type DeviceMeshSource =
  { kind: 'procedural' } | { kind: 'glb'; url: string; screenMesh: string }
```

## Rationale

- **Recolouring is a hard requirement.** Colour-matching lighting, backdrops and device
  bodies to the user's product palette is a headline feature. GLB colours are baked into
  textures and cannot be recoloured arbitrarily.
- **Fully local operation.** No assets to fetch, and the whole device library is a few KB of
  data rather than 10-80 MB of binaries.
- **Per-part toggles.** Showing or hiding the Dynamic Island, camera bump or buttons is
  trivial when we authored the parts. With a third-party GLB it depends on how the artist
  happened to name their meshes.
- **Licensing and trademark.** Free models of branded devices carry real ambiguity for a
  public open-source repo. Original procedural approximations do not.
- **Contribution cost.** A new device is a ~40-line data file, which makes "add my device"
  the easiest possible contribution.

## What we give up

The last ~10% of photorealism: speaker grille dot patterns, antenna band lines, keycap
sculpting, watch band stitching. Reachable with procedural texturing, but at real cost per
device.

The `glb` variant is the mitigation: if a specific device ever needs to be photoreal, it can
become photoreal in isolation.

## Consequences

- `lib/math/squircle.ts` becomes load-bearing — the continuous-curvature corner is what
  makes a phone read as a phone rather than as a rounded box.
- Materials must be generated at runtime (brushed-metal roughness, normal and anisotropy
  maps drawn on a canvas) rather than loaded.
- Realistic reflections matter more than usual, because shape and material are doing all the
  work that a baked texture would otherwise do. See ADR 0003.
