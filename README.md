# Mockup Studio

**Free, open-source, fully-local 3D mockup generator for websites and apps.**

Drop in a screenshot or a screen recording, and render it on a real device — phone, flip
phone, tablet, laptop, desktop or watch — inside a customizable 3D studio. Control the
camera, the lighting, the backdrop and the animation, then export a still or a video.

Everything runs in your browser. Nothing is uploaded anywhere, there is no account, and
there is no server.

> **Status: in active development.** See [`docs/PLAN.md`](docs/PLAN.md) for the roadmap and
> [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md) for the tracked feature list.

---

## Features

- **Real 3D, fully orbittable** — not a flat image with a perspective transform.
- **Procedural device models** — Dynamic Island and notches, camera bumps with real lenses,
  side and volume buttons, brushed titanium and anodized aluminium rails. Every device is a
  data file, so its colour and dimensions are yours to change.
- **Screenshots or video** — upload a `.png`/`.jpg` or an `.mp4`/`.webm` screen recording and
  it plays on the device screen.
- **Toggleable device details** — status bar (time, wifi, battery), gesture bar, Android nav
  bar, macOS menu bar and dock. Turn on only what you want to show.
- **Parametric studio lighting** — rim lights, glows and reflections you can position, shape
  and recolour. Colour-match them to your product's own palette in one click.
- **Parametric backdrops** — transparent, solid, gradient, radial glow, cyclorama or grid.
- **Camera, lighting and animation presets** — plus full manual control over every parameter.
- **2D window mockups** — macOS and browser chrome with traffic lights and a customizable
  title bar. Export flat, or display it on a laptop inside the 3D scene.
- **Export** — PNG at 1x/2x/4x with optional transparency, platform size presets, and WebM
  video recording of any animation.
- **Shareable presets** — the entire scene is one JSON manifest you can save, export, and
  import.

## Quick start

```bash
npm install
npm run dev
```

Then open the printed URL. Requires **Node 20.19+ or 22.12+**.

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

Three rules are enforced by tooling rather than by review, because they are the ones that
quietly erode:

1. **No hardcoded colours.** Literal colours are permitted only in `src/styles/tokens/`.
   Everywhere else must use a semantic token. `npm run lint:css` fails otherwise.
2. **No long files.** 150 lines per file, 80 per function. `npm run lint` fails otherwise.
   Tripping this is a signal to extract a component or a helper, not to raise the limit.
3. **Strict TypeScript**, including `noUncheckedIndexedAccess` and
   `exactOptionalPropertyTypes`.

See [`docs/architecture.md`](docs/architecture.md) for how the code is organised and
[`docs/design-tokens.md`](docs/design-tokens.md) for the theming system.

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md). Adding a new device is intentionally the easiest
contribution to make — it is usually a single data file.

## Licence

[MIT](LICENSE). No device manufacturer is affiliated with or endorses this project; all
device models are original procedural approximations, and brand names are used only to
describe form factors.
