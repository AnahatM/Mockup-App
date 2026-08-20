Every device in the app is generated from code. If you want something the catalogue does not have, you can import your own `.glb` or `.gltf` model instead.

## Importing

**Device tab → Model panel → Import .glb / .gltf**, then choose a file. Once loaded, a screen-mesh picker appears: the app lists every mesh in the file and auto-selects the one whose name looks most like a screen (`Screen`, `Display`, `LCD`, `Panel`, `Glass`), but you can always change it — your screenshot is applied to whichever mesh you choose.

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

- **Y up, real-world scale.** Millimetres or metres both work; the app fits the camera to whatever it finds by normalising to the model's own bounding box, not by assuming a particular unit.
- **A separate screen mesh.** The screen must be its own mesh so it can be picked and textured.
- **UVs on the screen mesh**, spanning 0–1, so the screenshot maps correctly — it is applied directly, with no extra cropping or re-projection.
- **Reasonable polygon count.** A model intended for offline rendering may be heavy in a browser. Very large files (over ~200 MB) trigger a warning.
- **`.glb`, not Draco-compressed.** A plain `.glb` loads with no network access. A standalone `.gltf` only works if every buffer and image inside it is embedded as base64 rather than a separate file, since only one file is selected. Draco-compressed meshes are not supported — decoding them would otherwise mean fetching a decoder from a CDN, which breaks this app's fully-local promise.

## What still works

Colour and material controls do not apply to an imported model: it uses its own materials, which is the point of importing one.

## Known limitation

Screen overlays — the status bar, gesture bar, menu bar and dock — are not yet composited onto an imported model's screen. They render normally on every built-in device, where they are a texture layer stacked in front of the screen quad; an imported model's screen mesh instead receives your screenshot or recording directly, with no overlay layer. Support for this is planned but not yet built.
