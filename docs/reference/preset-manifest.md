# Preset manifest format

A preset is **one self-contained JSON document** describing an entire scene, so
it can be saved, exported, shared and imported without any other state.

## Shape

```jsonc
{
  "kind": "mockup-studio",
  "version": 1,
  "id": "preset-a1b2c3d4",
  "name": "Hero shot — dark",
  "createdAt": "2026-08-19T10:00:00.000Z",
  "scene": {
    "device": {/* which device, colours, which details are shown */},
    "screen": {/* fit, zoom, pan, video playback */},
    "overlays": {/* status bar, gesture bar, menu bar, dock */},
    "flat": {/* window chrome */},
    "camera": {/* position, target, fov, navigation */},
    "lighting": {/* every light, plus ambient and environment */},
    "scene": {/* backdrop, pedestal, shadow, post-processing */},
    "animation": {/* clip, duration, easing, loop */},
    "exportConfig": {/* size preset, scale, transparency */},
  },
  "media": { "kind": "none" },
}
```

## The schema is not written twice

`manifest.ts` composes the **feature schemas themselves**:

```ts
export const sceneStateSchema = z.object({
  device: deviceConfigSchema.prefault({}),
  camera: cameraSchema.prefault({}),
  lighting: lightingSchema.prefault({}),
  // ...
})
```

The file format and the running store cannot drift apart, because they are the
same definitions. Adding a field to a feature adds it to the format for free.

Note these import `@/features/<name>/schema` directly rather than the feature
barrels. A barrel also exports components, which import the store, which composes
its slices back from the features — importing barrels here closes that loop and
leaves half the schemas `undefined` at module-init time. Schema modules are pure
Zod with no React and no store, so depending on them directly is safe by
construction, and ESLint permits that one path shape.

## Media is separable

| `media.kind` | Contains        | Use                                                                           |
| ------------ | --------------- | ----------------------------------------------------------------------------- |
| `none`       | nothing         | A _look_ you apply to whatever screenshot you have open. Small and shareable. |
| `embedded`   | a data URL      | A complete, self-contained reproduction.                                      |
| `external`   | just a filename | Records what the preset was built against.                                    |

**Saved presets never embed media.** A data URL would fill the ~5MB localStorage
quota after a handful of presets. File export is where the self-contained
version lives.

## Versioning and migration

Two kinds of change, handled differently:

- **Additive** changes need no migration. Every field in every feature schema
  carries a default, so a manifest written before a field existed simply gains
  it on parse. This covers the large majority of real changes.
- **Breaking** changes — a renamed or restructured field — need an entry in
  `MIGRATIONS` in `migrate.ts`, keyed by the version it upgrades _from_.

```ts
const MIGRATIONS: Readonly<Record<number, Migration>> = {
  1: (input) => ({ ...input, scene: renameThing(input.scene) }),
}
```

Then bump `MANIFEST_VERSION`. The chain applies every migration between the
file's version and the current one.

The map is empty while the format is at v1. The machinery exists anyway so the
first breaking change is a one-line addition rather than a redesign, and so it is
already covered by tests.

## Untrusted by default

An imported file comes from other people, other versions, and hand editing. None
of that may be able to crash the app, so **nothing in `parseManifest` throws** —
every failure path returns a `Result` with a message the user can act on:

```
This preset has an invalid value at "scene.camera.fov": too big: expected number to be <=90.
```

A preset from a newer format version is refused explicitly rather than
half-loaded:

```
This preset was made with a newer version of Mockup Studio (format 3).
```

localStorage entries are re-validated on every read too, since storage survives
across app versions and can be edited by hand. Corrupt storage means "no
presets", never a blank app.

## Sharing by link

`toShareFragment` encodes a media-less preset into a URL **fragment**, not a
query string — the scene never reaches a server even if the app is hosted
somewhere, which keeps the fully-local promise true of sharing too.

## Testing

`migrate.test.ts` covers the format's contract: partial and legacy manifests
loading with defaults, round-tripping through JSON unchanged, and a range of
hostile inputs (wrong kind, missing version, future version, wrong types,
out-of-range values, oversized arrays, non-objects) each rejected without
throwing.
