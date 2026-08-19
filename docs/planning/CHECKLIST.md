# Working checklist

The living to-do list. Every task the user has asked for lands here the moment
it is asked, before any work starts on it, so nothing is lost to an interrupted
session. `docs/planning/BACKLOG.md` holds the numbered, longer-lived items;
this file is the working view including the small stuff.

Status: `TODO` · `WIP` · `DONE` · `BLOCKED` (with a reason)

## Site & presentation

| # | Task | Status |
|---|---|---|
| S1 | Landing page: flashier, more presentable, room for screenshots/illustrations | TODO |
| S2 | Landing page: textured background, halftone dot shading, depth effect | TODO |
| S3 | Landing page: interaction effects (hover, parallax, reveal) | TODO |
| S4 | "Made by Anahat Mudgal" at top of landing, linking to anahatmudgal.com | TODO |
| S5 | Main navbar stays visible on the studio route — do not swap it for a studio bar | TODO |
| S6 | Studio controls bar sits *under* the main navbar | TODO |
| S7 | More controls in the studio toolbar | TODO |
| S8 | Viewport controls in the toolbar: zoom in/out, reset, fit, pan, rotate | TODO |
| S9 | Icons on every tool, page link and button (GitHub icon on "View source", nav icons) | TODO |
| S10 | Footer: cleaner, gradient shading | TODO |
| S11 | Screenshot slots on docs and about pages | TODO |
| S12 | Capture real screenshots of the app for those slots | TODO |
| S13 | Studio first paint: spinner/loading state instead of a blank viewport | TODO |
| S14 | Dark theme grey is washed out — raise saturation | TODO |
| S15 | Hero copy must work in "parametric" and "customizable" — they are the key features | TODO |

## Mockup features

| # | Task | Status |
|---|---|---|
| F1 | GLB/GLTF import with its own materials + screen-mesh picker (backlog #11) | TODO |
| F2 | Mirror real iPhone finish names in the colour palette (backlog #12) | TODO |
| F3 | App Store screenshot mode — panoramic multi-device layouts + headline text (#25) | TODO |
| F4 | Image cropping before the screenshot reaches the device (#26) | TODO |
| F5 | Standalone window/flat mockup mode, no device required (#27) | TODO |
| F6 | Background should read as a real 3D space, not a flat gradient (#29) | TODO |

## Competitive features

From shots.so (screenshot supplied by the user) and comparable tools. These are
things paid products do that we should match or beat.

| # | Task | Status |
|---|---|---|
| C1 | Container style presets: glass light/dark, inset light/dark, outline, border, liquid | TODO |
| C2 | Border shape control: sharp / curved / round, plus a radius slider | TODO |
| C3 | Shadow presets: none / spread / hug / adaptive, with an opacity slider | TODO |
| C4 | Layout preset gallery with live thumbnails, not just a names list | TODO |
| C5 | Multi-up layouts — 1, 2 or 3 devices in one composition | TODO |
| C6 | Separate Zoom and Tilt controls with a live preview | TODO |
| C7 | Undo / redo | TODO |
| C8 | "Start over" — reset the whole scene, behind a confirmation | TODO |
| C9 | Copy the export straight to the clipboard | TODO |
| C10 | Export scale selector shown inline on the export button (1x/2x/4x) | TODO |
| C11 | "Hide mockup" — render the screenshot on the backdrop with no device | TODO |
| C12 | Gradient backdrop presets that adapt to the uploaded media | TODO |
| C13 | Research pass: what else comparable tools offer that we lack | TODO |

## Project

| # | Task | Status |
|---|---|---|
| P1 | README in the `anahat-readme` house style (backlog #28) | TODO |
| P2 | Organise `docs/` into folders | DONE |
| P3 | Maintain this checklist as tasks arrive | ONGOING |
| P4 | Commit in stages as work lands | ONGOING |

## Standing constraints

These apply to every task above and are checked before each commit.

- No hardcoded CSS colours outside `src/styles/tokens/`.
- Everything themeable; both light and dark must stay at parity.
- 150 lines per file, 80 per function — extract rather than raise.
- Strict TypeScript; no `any`, no non-null assertions to silence the compiler.
- No network requests at runtime.
- DRY and modular; a new knob is a data change, not new JSX.
- `npm run verify` green before every commit.
