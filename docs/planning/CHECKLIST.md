# Working checklist

The living to-do list. Every task the user has asked for lands here the moment
it is asked, before any work starts on it, so nothing is lost to an interrupted
session. `docs/planning/BACKLOG.md` holds the numbered, longer-lived items;
this file is the working view including the small stuff.

Status: `TODO` · `WIP` · `DONE` · `BLOCKED` (with a reason)

## Site & presentation

| # | Task | Status |
|---|---|---|
| S1 | Landing page: flashier, more presentable, room for screenshots/illustrations | DONE |
| S2 | Landing page: textured background, halftone dot shading, depth effect | DONE |
| S3 | Landing page: interaction effects (hover, parallax, reveal) | DONE |
| S4 | "Made by Anahat Mudgal" at top of landing, linking to anahatmudgal.com | DONE |
| S5 | Main navbar stays visible on the studio route — do not swap it for a studio bar | DONE |
| S6 | Studio controls bar sits *under* the main navbar | DONE |
| S7 | More controls in the studio toolbar | DONE |
| S8 | Viewport controls in the toolbar: zoom in/out, reset, fit, pan, rotate | DONE |
| S9 | Icons on every tool, page link and button (GitHub icon on "View source", nav icons) | DONE |
| S10 | Footer: cleaner, gradient shading | DONE |
| S11 | Screenshot slots on docs and about pages | DONE |
| S12 | Capture real screenshots of the app for those slots | TODO |
| S13 | Studio first paint: spinner/loading state instead of a blank viewport | DONE |
| S14 | Dark theme grey is washed out — raise saturation | DONE |
| S15 | Hero copy must work in "parametric" and "customizable" — they are the key features | DONE |
| S16 | Palette reads too yellow/brown — move the whole scheme cool, blue/green | DONE |
| S17 | Studio toolbar controls left-aligned, not spread across the bar | DONE |
| S18 | Tooltips must flip/clamp so they stay on screen near any viewport edge | DONE |

## Mockup features

| # | Task | Status |
|---|---|---|
| F1 | GLB/GLTF import with its own materials + screen-mesh picker (backlog #11) | TODO |
| F2 | Mirror real iPhone finish names in the colour palette (backlog #12) | TODO |
| F3 | App Store screenshot mode — panoramic multi-device layouts + headline text (#25) | TODO |
| F4 | Image cropping before the screenshot reaches the device (#26) | TODO |
| F5 | Standalone window/flat mockup mode, no device required (#27) | TODO |
| F6 | Background should read as a real 3D space, not a flat gradient (#29) | TODO |
| F8 | Light gizmos: icons showing each light's position, direction and colour — NOT the light panels themselves, which must stay invisible in the render. Toggleable from the toolbar; every light editable in the inspector | TODO |
| F7 | Recent uploads — keep the last few screenshots so the user can switch between them | DONE |

## UX and robustness

| # | Task | Status |
|---|---|---|
| U1 | React error boundary with a well-designed error screen, not the router's default | TODO |
| U2 | A proper 404 page | TODO |
| U3 | Empty states everywhere something can be empty | TODO |
| U4 | Keyboard shortcut reference / help overlay | TODO |
| U5 | Focus-visible styling audit across every interactive control | TODO |
| U6 | `prefers-reduced-motion` honoured by every animation | TODO |
| U7 | Toast/inline feedback when an action succeeds (export saved, preset applied) | TODO |
| U8 | Offline/local reassurance surfaced in the UI, not only in the docs | TODO |

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
| C7 | Undo / redo | DONE |
| C8 | "Start over" — reset the whole scene, behind a confirmation | DONE |
| C9 | Copy the export straight to the clipboard | DONE |
| C10 | Export scale selector shown inline on the export button (1x/2x/4x) | TODO |
| C11 | "Hide mockup" — render the screenshot on the backdrop with no device | TODO |
| C12 | Gradient backdrop presets that adapt to the uploaded media | TODO |
| C13 | Research pass: what else comparable tools offer that we lack | TODO |

## Project

| # | Task | Status |
|---|---|---|
| P1 | README in the `anahat-readme` house style (backlog #28) | DONE |
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
