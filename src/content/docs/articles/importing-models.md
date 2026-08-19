Every device in the app is generated from code. If you want something the catalogue does not have, you can import your own `.glb` or `.gltf` model instead.

## Importing

**Device → Model → Import model**, then choose a file. Once loaded, pick which mesh is the screen — the app lists every mesh in the file, and your screenshot is applied to the one you choose.

The model brings its own materials and is rendered as authored, so a model with proper PBR materials will look the way its author intended.

## Where to find models

| Source | Licence | Notes |
| --- | --- | --- |
| [Sketchfab](https://sketchfab.com) | Varies — filter for Downloadable + CC0/CC-BY | The largest selection of device models |
| [Poly Haven](https://polyhaven.com/models) | CC0 | Excellent quality, mostly props |
| [ambientCG](https://ambientcg.com) | CC0 | Models and materials |
| [Quaternius](https://quaternius.com) | CC0 | Stylised |

> [!WARNING]
> Manufacturer design resources — Apple's, Google's and Samsung's device art — are generally licensed for designing your own app's interface, **not** for redistribution. Using one locally is usually fine; committing it to a public repository usually is not. Check the licence.

## Preparing a model

A few things make a model work well here:

- **Y up, real-world scale.** Millimetres or metres both work; the app fits the camera to whatever it finds.
- **A separate screen mesh.** The screen must be its own mesh so it can be picked and textured.
- **UVs on the screen mesh**, spanning 0–1, so the screenshot maps correctly.
- **Reasonable polygon count.** A model intended for offline rendering may be heavy in a browser.

## What still works

Screen overlays — the status bar, gesture bar, menu bar and dock — work on an imported model exactly as on a built-in device, because they are drawn as a texture layer rather than geometry.

Colour and material controls do not apply to an imported model: it uses its own materials, which is the point of importing one.
