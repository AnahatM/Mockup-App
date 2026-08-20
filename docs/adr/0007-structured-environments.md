# ADR 0007 — Backdrop structures are separate from backdrop modes

**Status:** accepted
**Date:** 2026-08-20

## Context

The backdrop had one axis of choice: `backdrop.mode`, a seven-value enum running
`transparent · solid · gradient · glow · environment · cyclorama · grid`. Five of
those paint the scene's background. Two — `cyclorama` and `grid` — additionally
place real geometry that catches light.

Two requests arrived that this shape could not absorb.

**F6 / C12** asked that the background read as a real 3D space rather than a flat
gradient. **F15** asked for structured environments: hexagon tiles, a square-tile
room with real corner shading, and blocks that pulsate up and down — parametric
and procedural, with no bundled assets.

The obvious move was to add `hex`, `tile-room` and `blocks` to `BACKDROP_MODES`.
Writing out what that implies is what killed it. A mode is exclusive: choosing
`hex` would mean giving up the gradient behind it. But a hex-tiled floor standing
in front of a warm gradient is not a compromise between the two — it is the
combination that actually produces depth. The gradient supplies the distance, the
tiles supply the parallax, and the eye needs both to stop reading the image as a
product pasted onto a picture.

Put another way: the flat gradient was never the problem F6 described. A gradient
with nothing in front of it was.

## Decision

`mode` keeps its current meaning — what the background is painted with — and a
new, independent `scene.backdrop.structure` config describes geometry standing in
front of it.

```
structure: { kind: 'none' | 'hex' | 'tiles' | 'room' | 'blocks', … }
```

The two compose freely. `kind: 'none'` is the default, so every preset saved
before this existed renders exactly as it did.

Three consequences follow from the existing invariants rather than from taste:

- **Structures are generated, never loaded.** Fully-local is a product promise,
  so a hex field is a lattice function and a seed, not a mesh on disk. The
  deterministic value noise in `features/textures/noise.ts` already existed for
  procedural surface textures and is reused rather than reimplemented, which also
  means a saved seed reproduces a layout exactly.
- **Structures are data.** A new environment is a `kind` and a branch, and its
  knobs are entries in a control schema — not a new panel.
- **Surface texture is one system.** `structure.texture` is the same
  `surfaceTextureSchema` the device body, the device frame and the pedestal use.
  This is what carries F16 to the walls: six knobs, one implementation, one
  texture cache.

## Consequences

- The room kind gets real corners rather than a painted vignette, so the
  ambient-occlusion pass darkens them and the light rig genuinely falls off
  across them. That is the "real room shading" half of F15, and it is a
  consequence of using geometry rather than a separate feature.
- Anything instanced and animated writes matrices in the frame loop, never to
  the store — the same rule `AnimatedProduct` follows, for the same reason.
  Pulsating blocks honour `prefers-reduced-motion` and hold their resting pose.
- Two things now put geometry in the background: the cyclorama and a structure.
  Both are subject to the failure mode ADR-adjacent items F9 and F20 recorded —
  backdrop geometry seen from outside, and backdrop geometry occluding a device
  whose camera sits further back because the device is larger. Structure extents
  have to be reasoned about against camera distance, not chosen by eye.
- The mode enum stays the size it is. That matters more than it looks: `mode` is
  serialised into every saved preset, and each value added to it is a migration
  case for the rest of the project's life.

## Alternatives considered

- **More entries in `BACKDROP_MODES`.** Rejected for the reason above: it makes
  the gradient and the geometry mutually exclusive when the whole point is that
  they are complementary. It would also have grown the enum that presets migrate
  against, permanently.
- **A bundled HDRI or a downloaded environment mesh.** Rejected outright — it
  breaks the fully-local promise, which is not tradeable.
- **Solving F6 with a better gradient.** Tried first, and the reason this ADR
  exists. No gradient is parallax; a flat image cannot move with the camera, and
  that is precisely the cue that gives away a composite.
