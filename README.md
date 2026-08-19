# Mockup Studio

**Free, open-source, fully-local 3D mockup generator for websites and apps.**

Drop in a screenshot or a screen recording, and render it on a real device —
phone, flip phone, tablet, laptop, desktop or watch — inside a customizable 3D
studio. Control the camera, the lighting, the backdrop and the animation, then
export a still or a video.

Everything runs in your browser. Nothing is uploaded anywhere, there is no
account, and there is no server.

---

## Features

- **Real 3D, fully orbittable.** Editor-style navigation: drag to orbit, right or
  middle drag to pan, scroll to zoom. Not a flat image with a perspective
  transform.
- **Fifteen procedural devices.** Phones, folding phones, tablets, laptops,
  desktop monitors and watches — with Dynamic Islands and notches, camera bumps
  with real lenses, side buttons, stands and watch straps. Every device is a data
  file, so its colour and dimensions are yours to change.
- **Screenshots or video.** Upload a `.png`/`.jpg` or an `.mp4`/`.webm` screen
  recording and it plays on the device screen.
- **Toggleable device details.** Status bar (time, wifi, battery), gesture bar,
  Android nav bar, macOS menu bar and dock — each independently switchable, and
  only offered where it makes sense.
- **2D window mockups.** macOS and browser chrome with traffic lights, tabs, a
  URL bar and a customizable title bar. Export flat, _or_ display it on a laptop
  inside the 3D scene.
- **Parametric studio lighting.** Rim lights, glows and reflections you can
  position, shape and recolour. Seven rigs plus full manual control.
- **Brand colour matching.** The dominant colours of your screenshot become
  one-click sources for the backdrop glow, rim lights, device body or pedestal.
- **Parametric backdrops.** Transparent, solid, gradient, radial glow, cyclorama
  or grid.
- **Camera and motion presets.** Nine angles and nine motion clips, all
  size-independent, plus scrubbing and full manual control.
- **Export.** PNG at any resolution with platform size presets and optional
  transparency, plus WebM video recording.
- **Shareable presets.** The entire scene is one JSON manifest you can save,
  export and import.
- **Light and dark.** A quiet "chalk" theme that stays out of the way of your
  work.

## Quick start

```bash
npm install
npm run dev
```

Then open the printed URL. Requires **Node 20.19+ or 22.12+**.

## Keyboard shortcuts

| Key     | Action                     |
| ------- | -------------------------- |
| `F`     | Frame the current device   |
| `Space` | Play / pause the animation |
| `[`     | Toggle the device rail     |
| `]`     | Toggle the inspector       |

## Scripts

| Script              | Purpose                                           |
| ------------------- | ------------------------------------------------- |
| `npm run dev`       | Start the dev server                              |
| `npm run build`     | Typecheck and build for production                |
| `npm run preview`   | Preview the production build                      |
| `npm run typecheck` | TypeScript only                                   |
| `npm run lint`      | ESLint (includes the file-length limits)          |
| `npm run lint:css`  | Stylelint (includes the no-hardcoded-colour rule) |
| `npm run test`      | Unit tests                                        |
| `npm run verify`    | All of the above, in order                        |

## Project conventions

Three rules are enforced by tooling rather than by review, because they are the
ones that quietly erode:

1. **No hardcoded colours.** Literal colours are permitted only in
   `src/styles/tokens/`. Everywhere else must use a semantic token.
   `npm run lint:css` fails otherwise.
2. **No long files.** 150 lines per file, 80 per function. `npm run lint` fails
   otherwise. Tripping this is a signal to extract, not to raise the limit.
3. **Strict TypeScript**, including `noUncheckedIndexedAccess` and
   `exactOptionalPropertyTypes`.

See [`docs/architecture.md`](docs/architecture.md) for how the code is organised
and [`docs/design-tokens.md`](docs/design-tokens.md) for the theming system.

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md). Adding a device is intentionally the
easiest contribution to make — it is usually a single data file. See
[`docs/device-specs.md`](docs/device-specs.md).

## Licence

[MIT](LICENSE). No device manufacturer is affiliated with or endorses this
project; all device models are original procedural approximations, and brand
names are used only to describe form factors.
