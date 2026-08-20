Materials decide whether a surface reads as glass, brushed metal or plastic. Every device ships with the finishes it really has, and every one of them can be changed.

## The two axes

A device body has a **frame** (the side band) and a **back**. Each takes any finish independently, so a titanium frame with a glossy glass back is one dropdown away — as is a soft-touch plastic body with a polished rail.

## Available finishes

| Finish | Metal | Character |
| --- | --- | --- |
| Brushed titanium | Yes | Coarse directional grain, warm streaks |
| Brushed aluminium | Yes | Finer grain, brighter |
| Anodised aluminium | Yes | Bead-blasted, no grain |
| Brushed steel | Yes | Very smooth with a faint grain |
| Polished metal | Yes | Mirror |
| Matte glass | No | Soft diffused reflections |
| Glossy glass | No | Sharp reflections |
| Ceramic | No | Between matte glass and plastic |
| Soft-touch plastic | No | Fine texture, low sheen |
| Glossy plastic | No | Bright, slightly cheaper-looking |

Brushed finishes stretch their highlights along the grain direction — that streak running down a rail is the thing that says "machined metal" rather than "grey".

## Screen glass

Separate, because a display is always glass. The only real question is whether it is **glossy** or has a **matte** anti-glare etch, and that changes how much of the room it mirrors back.

Matte is worth trying when the screen is picking up a distracting reflection, or when you want the screenshot itself to dominate.

## Colour and finish are independent

Any finish takes any colour. A brushed metal in your brand colour is a legitimate thing to make — physically it is what an anodised part is.

## Procedural surface textures

Underneath a finish you can layer a second, independent pattern: noise, fine grain, brushed metal, scratches or a woven weave. Every pixel is generated on a canvas at load time from a handful of numbers — nothing is ever downloaded or shipped as an image, which is what keeps the app fully local.

The pattern is available in three places, each with its own settings:

- **Body texture** — the device's back/body surface.
- **Frame texture** — the device's side band, buttons and stand.
- **Pedestal texture** — the plinth the product stands on.

Each has the same six controls:

| Control | What it does |
| --- | --- |
| Pattern | Which generator: noise, fine grain, brushed metal, scratches, or woven fabric. `None` leaves the finish exactly as built. |
| Scale | Tile frequency — higher reads as finer grain. |
| Strength | How strongly the pattern bumps the surface under light (drives the normal map). |
| Contrast | How much the pattern varies the roughness around the finish's own value. |
| Direction | Horizontal or vertical — only meaningful for the directional patterns, brushed and scratches. |
| Seed | Reproducibility. The same seed always regenerates the exact same look. |

A texture generates a roughness map and a normal map together, so it actually reads as a bumped surface rather than only tinting the reflection — a scratch, for instance, should catch a highlight, not just look like a grey line. Setting a strength or contrast of 0 leaves the surface visually identical to the finish alone, and `Pattern: None` (the default) means every preset saved before this feature existed keeps rendering exactly as it did before.

## Imported models

A 3D model you import brings its own materials, which are used as authored. See [Importing 3D models](/docs/importing-models).
