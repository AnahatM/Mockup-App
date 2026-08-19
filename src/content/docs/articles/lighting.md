Lighting is the single biggest lever on whether a render looks like a product photograph or like a 3D model. This page covers the rig, the room, and environment maps.

## Rigs

The **Light** tab starts with a preset rig. Seven ship with the app:

| Rig | Character |
| --- | --- |
| Studio | Balanced three-point. The safe default |
| Rim glow | Dim front, bright edges — makes metal read as metal |
| Soft box | Large wrapping sources, almost shadowless |
| Dramatic | One hard key, one cold rim, deep shadows |
| Neon | Magenta and cyan edges over a dark room |
| Product white | Bright and even, catalogue style |
| Moody | Low warm key with a single cool kicker |

Editing any light switches the rig to **Custom** — nothing is lost, it just stops claiming to be a preset.

## Individual lights

Each light is a panel, a disc or a ring with a position, size, colour and intensity. Add up to eight.

**Bigger panels give softer, wider reflections.** That is the main thing to know: to soften a highlight, enlarge the light rather than dimming it.

Leave **Rotation** at zero and a light aims itself at the product. Rotate it and it keeps your rotation.

> [!TIP]
> Turn on **Show light markers** to see where your lights actually are. A parametric rig is invisible by definition — the lights only exist as reflections — so positioning one otherwise means dragging three numbers blind. Markers never appear in an export.

## The room

Under **Room**. This is a soft enclosing surface, brighter above and darker below, that surrounds the whole scene.

It matters more than it sounds. Without it, every direction that is not a light panel reflects pure black — so a metal rail lights on one face only, a dark device reads as painted vantablack, and a camera lens reflects nothing and stops looking like glass. Real product studios solve this with a light tent, and the room is that.

**Ceiling**, **Horizon** and **Floor** set its gradient; **Room light** sets its strength.

## Environment maps

Load a `.hdr` or `.exr` file for real natural light — a room, a window, an overcast sky. A loaded map replaces the procedural room entirely, since the point of loading one is its own light.

**Map rotation** turns it, which is how you move where the light comes from.

Free HDRIs: [Poly Haven](https://polyhaven.com/hdris), [ambientCG](https://ambientcg.com), [HDRI Skies](https://hdri-skies.com). Download one and load it here — like everything else, it never leaves your machine.

## Reflection detail

The cubemap resolution. Low values make polished surfaces sparkle, because the highlight crawls from texel to texel as the camera moves. 512 is a good default; raise it if you see shimmer on a mirror finish.
