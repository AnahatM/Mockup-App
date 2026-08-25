# ADR 0009 — A backdrop structure is sized against the product in front of it

**Status:** accepted
**Date:** 2026-08-25

## Context

The structured environments (ADR 0007) are laid across the whole floor from a
handful of numbers: a pitch, an extent, a depth, a relief, and for the block
field a pulse height. Every one of those is in world units, and none of them
had any relationship to the thing standing in the middle of the scene.

Three failures came out of that, and all three shipped:

1. **The field rose through the product.** The block field's origin cell lifted
   by up to three world units on every cycle, straight up through a phone that
   is one and a half units tall. The tile fields had the milder version of it:
   every tile is `depth` tall and the whole field stood on the floor plane, so
   the device's feet were buried by exactly one tile depth. The field's own
   radial falloff looks like it should have prevented this and does not — it is
   a fraction of the *field's* extent, so it says nothing about how big the
   device is. At the default size a tile a whole unit from the origin is
   already at an eighth of full relief, and the pulse ignored it entirely.

2. **The field swallowed the scene.** With the depth and relief sliders both at
   maximum the relief gain compounded to `depth * (1 + 1 * 4)` — fifteen units —
   the camera ended up inside a block, and the viewport went to flat grey.
   Nothing failed. It type-checked, it rendered, it animated. It simply was not
   a scene any more.

3. **The field could vanish.** Nothing stopped the tile-size slider being set
   larger than the field it tiles. At a pitch of 3 across an extent of 2 the
   lattice generated a single cell, at the origin, which the clearance then
   flattened — so the environment drew literally nothing while its controls sat
   there looking live.

## Decision

**A structure is sized against the product, not in the abstract.** Three
derived quantities cross from the device catalogue into the environments, none
of them configurable and none of them saved in a preset:

- **`clearanceRadiusFor(spec)`** — the half-diagonal of the device's footprint,
  plus a margin. Inside it, nothing lifts off the floor: relief is zero and the
  pulse is zero. A half-*diagonal* because the device rotates freely about Y
  and a circle is the only exclusion that holds at every yaw. Outside it,
  `clearanceAt` eases back to full height over a band, because cutting the wave
  off at a hard circle reads as its own bug — a round crater in a rippling
  field — where an eased one reads as the product settling into the floor.

- **`productHeightFor(spec)`** — the ceiling. A backdrop is behind the product
  by definition, and towering over it is never the shot anyone wanted. It is
  split between the tile's resting height (60%) and how far a block may rise
  (40%) rather than capping the sum, so that pushing the depth slider to the
  top does not silently leave the pulse nothing to move through.

- **`cappedPitch(pitch, extent)`** — a floor on detail to match the existing
  ceiling. `fitPitch` already coarsens a field that would exceed the instance
  budget; this stops one being so coarse that it is a single tile hidden under
  the product.

The field is also **sunk by one resting depth** (`fieldOffsetY`), so the flat
plateau the clearance holds under the product has its top face at y=0 — where
the device's feet, the pedestal and the contact shadow already are.

## Consequences

The defaults are untouched, deliberately and under test: on the device the app
opens with, at the structure settings it opens with, not one tile moves. Every
cap is checked to bind only where the result was unusable.

Shorter devices get shorter fields. A watch is about a third of a phone's
height and the blocks behind it are correspondingly smaller. That is the rule
working rather than an exception to it, but it does mean one saved preset
renders at different absolute scales on different devices — the same bargain
`pedestalRadiusFor` and `shadowScaleFor` already made, for the same reason.

The device-to-environment dependency is new and worth naming. It runs one way,
through the pure `devices/state` barrel, and it is derived at render time
rather than stored: a preset saved with a phone in the middle stays correct
when it is loaded with a monitor in the middle, which storing the radius would
not have managed.

Testing needed both halves. `environments/clearance.test.ts` drives the maths
against every device in the catalogue — an early version used one made-up
radius and proved almost nothing, because at the default pitch a phone's
clearance contains exactly one cell and that one was already flat.
`scripts/verify-structure-extremes.mjs` covers what a unit test cannot see: it
drives the real sliders to their corners and measures the spread of luminance
across the viewport, because "the camera is inside the geometry" is a rendering
outcome rather than a number any pure function returns.

One thing deliberately not attempted: a pixel test for the intrusion itself. A
block rising *through* the device and a block standing *in front of* it are the
same pixels, and a test that cannot tell those apart would fail whenever
someone legitimately raised the pulse. The maths is covered per-device instead,
and the wiring is covered by keeping the component a one-line composition over
functions that are.
