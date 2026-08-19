# ADR 0003 — Parametric Lightformer studio instead of an HDRI environment

**Status:** Accepted
**Date:** 2026-08-19

## Context

Product renders live or die on their reflections. The conventional approach is to load an
HDRI environment map. drei ships `<Environment preset="studio" />`, which is one line.

Two project requirements complicate that: the app must run **fully locally**, and the user
must be able to **colour-match rim lights and glows** to their product's palette.

## Decision

Build the environment from parametric `<Lightformer>` panels rendered into a local cubemap:

```tsx
<Environment resolution={256} frames={1}>
  {lights.map((l) => (
    <Lightformer
      key={l.id}
      form={l.shape}
      position={l.position}
      scale={l.scale}
      color={l.color}
      intensity={l.intensity}
    />
  ))}
</Environment>
```

## Rationale

- **drei's built-in presets fetch from a CDN**, which breaks the fully-local requirement.
  Bundling our own HDRI would fix that but add megabytes.
- **An HDRI is a photograph — it cannot be recoloured meaningfully.** Lightformers are
  objects with a `color` prop, so "match this rim light to my brand blue" is a one-line
  binding rather than an impossibility.
- **Every light becomes a control surface.** Shape, position, rotation, scale, colour and
  intensity are all live knobs, which is exactly the customizability the product promises.
- The streak of a light down a titanium rail is a _real_ reflection of a real object, so it
  responds correctly as the user orbits.

## Consequences

- `frames={1}` bakes the environment once for performance, so the cubemap must be
  re-baked when the lighting config changes. The `<Environment>` is keyed on a hash of the
  lighting state to force this.
- Lighting presets are plain data — arrays of lightformer descriptions — which means they
  serialise into the preset manifest for free.
- We are responsible for making the default studio look good, since we do not inherit a
  photographer's HDRI. This is a design cost, not a technical risk.
