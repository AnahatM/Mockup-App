A preset is an entire scene saved as one file: the device, its colours and materials, the lighting, the backdrop, the camera, the animation and the export settings.

## Premade looks

The **Presets** tab ships with sixteen, grouped by feel. Each one shows a small
preview of the look beside its name.

| Group | Presets |
| --- | --- |
| Studio | Clean studio, Soft light, Glass desk |
| Dramatic | Dark hero, Neon edge, Rim metal |
| Flat | Catalogue white, Blueprint, Transparent cutout, App Store portrait |
| Window | Glass browser, macOS dark, Outlined shot, Bare screenshot |
| Motion | Floating turntable, Hero reveal |

The **Window** group sets up the 2D window mockup rather than the 3D scene —
the browser or macOS chrome, the container treatment and the shadow. "Bare
screenshot" drops the frame entirely and puts your image straight on the
backdrop.

Applying one changes the scene but never your screenshot, so you can try all
sixteen against the same image.

## Saving your own

Type a name and press **Save**. Saved presets live in your browser and survive a reload.

> [!NOTE]
> A saved preset stores the *look*, not your screenshot. That is deliberate: a preset is something you apply to whatever you have open, and embedding an image would fill your browser's storage after a handful of them.

## Sharing

**Export** on a saved preset writes a `.mockup.json` file. Anyone can import it with **Import preset file** and get your exact scene.

The format is plain JSON and readable — you can open one and see every setting.

## If something is wrong with a file

Imported files are validated before they touch the app. A file that is corrupt, hand-edited into an invalid state, or made by a newer version of Mockup Studio is refused with a message naming the problem, rather than half-loading or crashing.
