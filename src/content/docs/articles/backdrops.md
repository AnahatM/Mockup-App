The backdrop is everything behind the product. Seven modes, from a flat colour to a real 3D space — and, layered in front of any of them, an optional structured environment built from real geometry.

| Mode | What it is |
| --- | --- |
| Transparent | Nothing. For PNG exports that drop onto a design |
| Solid | One flat colour |
| Gradient | Two colours, at any angle |
| Glow | A radial pool of light behind the product |
| Environment | The lighting room itself, shown in 3D |
| Cyclorama | A curved studio sweep — floor curving into a wall with no seam |
| Grid | A technical grid floor that fades with distance |

## Which to use

**Cyclorama** is the default and is what most product photography actually uses: an infinity cove, so there is no visible corner behind the product. It is real geometry, so it catches your lighting and the product's shadow.

**Environment** shows the room from the Light tab as the background. Because it is a real environment rather than a painting, it has depth and parallaxes as the camera orbits — which is what stops a mockup looking composited.

**Transparent** is the one to use when the mockup is going into a design. Combined with **Transparent** in the Export tab you get a PNG with a genuine alpha channel.

## Environments

The mode decides what the background is *painted* with. An environment is
separate from that: real geometry standing in front of whatever the mode
painted, so the two combine rather than compete. A gradient supplies the sense
of distance and a structure supplies the parallax, and a backdrop generally
needs both before it stops reading as a picture the product was pasted onto.

| Environment | What it is |
| --- | --- |
| Hexagon tiles | A hex-tiled floor, rising with distance |
| Tiled floor | The same, in squares |
| Tiled room | A floor and four walls, with real corners |
| Pulsating blocks | A block grid rippling outward from the product |

All four are generated from the numbers in the panel — the tile size, the gap
between tiles, how far the field reaches, and a seed. Nothing is downloaded and
nothing is bundled, so the same seed always lays out the same field and a saved
preset reproduces it exactly.

**Relief** raises tiles with their distance from the centre and deliberately
leaves the product's own patch of floor flat, so nothing pushes up through its
shadow.

**Tiled room** is the one to reach for when you want the shot to feel like it
was taken somewhere. Its corners are real geometry, so ambient occlusion
darkens them and the lighting genuinely falls off across them — turn **Ambient
occlusion** up in the Render panel to see it.

**Pulsating blocks** is the only environment that moves. If your system asks
for reduced motion it holds its resting pose instead, so the composition is
unchanged and exports are unaffected.

## Matching your screenshot

**Adaptive backdrops** builds a set of gradients from the colours in the image
you uploaded, and applying one sets the mode and both colours together.

They deliberately do not simply reuse your screenshot's dominant colour: a
backdrop painted in it camouflages the very thing standing in front of it. Each
recipe either pulls away in hue or drops far enough in lightness to stay
separate. If your screenshot is essentially greyscale there is no brand colour
to work from, and the panel says so rather than inventing one.

## The plinth

The plinth is the surface the device stands on. It has a shape, a radius, a colour and a roughness.

**Height** is worth knowing about: a shallow plinth shows its own underside and reads as a floating disc. Increasing the height extends it downward out of frame, so it reads as a column instead. The default is deep enough that its bottom is never visible.

Turn it off entirely for a product that should look like it is standing on nothing — which is usually what you want under a hex field or a block grid, since the plinth would otherwise cover the tiles it stands on.

## Texture

The sweep, the plinth and an environment all take the same procedural surface
texture — noise, fine grain, brushed metal, scratches or woven fabric. See
[Materials](/docs/materials) for what the six knobs do.

The backdrop is the largest surface in the frame, so it is also where a
perfectly flat colour gives a render away fastest. A little grain goes a long
way.

## Shadow

The contact shadow is what grounds the product. **Opacity**, **Blur** and **Spread** shape it.

It composites correctly over an empty background, so a transparent export keeps its shadow.
