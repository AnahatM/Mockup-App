A preset file is one self-contained JSON document describing an entire scene. This page documents the format for anyone generating or editing one outside the app.

## Shape

```json
{
  "kind": "mockup-studio",
  "version": 1,
  "id": "preset-a1b2c3d4",
  "name": "Hero shot",
  "createdAt": "2026-08-19T10:00:00.000Z",
  "scene": {
    "device": {},
    "screen": {},
    "overlays": {},
    "flat": {},
    "camera": {},
    "lighting": {},
    "scene": {},
    "animation": {},
    "exportConfig": {}
  },
  "media": { "kind": "none" }
}
```

Every section may be partial or omitted. Missing fields take their defaults, which is what lets a preset written before a feature existed still load.

## Media

| `media.kind` | Contains | Use |
| --- | --- | --- |
| `none` | Nothing | A look you apply to whatever you have open |
| `embedded` | A data URL | A complete self-contained reproduction |
| `external` | A filename | Records what it was built against |

Presets saved in the app never embed media, to keep browser storage usable. File exports may.

## Versioning

`version` is the format version, not the app version. A file from an older format is upgraded on load; a file from a newer one is refused with an explanation rather than half-read.

## Validation

Everything is validated on import. Values are range-checked — a field of view of 9999 is rejected, naming the field — and unknown values fall back to defaults where that is safe. A malformed file cannot crash the app.

## Editing by hand

Perfectly reasonable. Colours are `#rrggbb` strings, angles are radians, positions are `[x, y, z]` arrays in scene units where one unit is 100mm.
