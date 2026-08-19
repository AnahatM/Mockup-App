# Preset manifest format

> **Status: pending.** The manifest schema, storage and import/export land in **P10** of
> [`PLAN.md`](PLAN.md). This document will carry the full field reference, the versioning
> policy and the migration guide once that system exists.

## The shape of the idea

A preset is **one self-contained JSON file** describing an entire scene, so it can be saved
to localStorage, exported, shared, and imported without any other state.

```jsonc
{
  "$schema": "mockup-studio/v1",
  "version": 1,
  "name": "Hero shot — dark",
  "scene": {
    "device": {/* which device, body colour, which details are shown */},
    "screen": {/* fit mode, offset, zoom, which overlays are on */},
    "camera": {/* position, target, fov, roll */},
    "lighting": {/* every lightformer, plus bloom and exposure */},
    "backdrop": {/* mode and its parameters */},
    "animation": {/* clip, duration, easing, loop */},
    "export": {/* size preset, scale, transparency */},
  },
  "media": { "kind": "none" },
}
```

Media is optional and separable: `{ "kind": "none" }` keeps a preset small and shareable,
while `{ "kind": "embedded", "dataUrl": "..." }` makes it a complete, self-contained
reproduction.

Every manifest is validated by the same Zod schemas that type the store, so a malformed or
hostile file becomes a readable error rather than a crash — see
[`adr/0004-zod-config-source-of-truth.md`](adr/0004-zod-config-source-of-truth.md).
