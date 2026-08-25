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
| S12 | Capture real screenshots of the app for those slots | DONE |
| S13 | Studio first paint: spinner/loading state instead of a blank viewport | DONE |
| S14 | Dark theme grey is washed out — raise saturation | DONE |
| S15 | Hero copy must work in "parametric" and "customizable" — they are the key features | DONE |
| S16 | Palette reads too yellow/brown — move the whole scheme cool, blue/green | DONE |
| S17 | Studio toolbar controls left-aligned, not spread across the bar | DONE |
| S19 | Whole app mobile-responsive — every page, and the studio's panels/tools/options | DONE |
| S20 | Footer local-only badge: rectangular, small radius, not a pill | DONE |
| S21 | Landing backdrop gradient still visibly cuts off before the page edge | DONE |
| S18 | Tooltips must flip/clamp so they stay on screen near any viewport edge | DONE |

## Mockup features

| # | Task | Status |
|---|---|---|
| F1 | GLB/GLTF import with its own materials + screen-mesh picker (backlog #11) | DONE |
| F2 | Mirror real iPhone finish names in the colour palette (backlog #12) | DONE |
| F3 | App Store screenshot mode — panoramic multi-device layouts + headline text (#25) | DONE |
| F4 | Image cropping before the screenshot reaches the device (#26) | DONE |
| F5 | Standalone window/flat mockup mode, no device required (#27) | DONE |
| F6 | Background should read as a real 3D space, not a flat gradient (#29) | DONE |
| F15 | Structured backdrop environments — hexagon tiles, square-tile room, real room shading, pulsating blocks oscillating up and down, and more. All parametric and procedural, no bundled assets | DONE |
| F16 | Procedural surface textures — noise, brushed metal, etc. — applicable to pedestal, walls and devices | DONE |
| F17 | Update the built-in presets to use the new backdrop environments and textures | DONE |
| F18 | Live 2D preview driven by the same compositor as the export, working with no WebGL | DONE |
| F19 | **Decided:** split the 2D tools onto their own route and page, separate from the 3D studio. Not a modal bolted onto the studio — a genuinely separate tool that loads without the 3D scene | DONE |
| F9 | A large triangular slab is visible in the background from some camera angles — the backdrop seen from outside | DONE |
| F10 | Fly controls feel unintuitive, especially on a trackpad; the camera drifts away | DONE |
| F11 | Unity-style axis gizmo showing current 3D orientation | DONE |
| F20 | **Bug:** desktop devices are invisible — the cyclorama is a filled solid whose implicit closing face occludes them, because camera distance scales with device size but the cove does not. Diagnosed and handed to the viewport workstream; `scripts/verify-desktop.mjs` is the regression test | DONE |
| F12 | Fly mode: Q/E for up and down alongside WASD | DONE |
| F13 | Show every viewport control and keybinding in the UI, not just the docs | DONE |
| F14 | More bindings for trackpad users — e.g. Space to pan, easier dragging without a mouse | DONE |
| F8 | Light gizmos: icons showing each light's position, direction and colour — NOT the light panels themselves, which must stay invisible in the render. Toggleable from the toolbar; every light editable in the inspector | DONE |
| F7 | Recent uploads — keep the last few screenshots so the user can switch between them | DONE |
| F21 | **Bug:** zoom in/out resets the camera orientation — zooming must keep the current view direction and target, whatever angle you are looking from | DONE |
| F22 | **Bug:** device contact shadows on the ground/pedestal are broken up rather than continuous, and flicker | DONE |
| F23 | **Bug:** the pulsating block field rises straight through the device; tile fields bury its feet by one tile depth. Environments now know the product's footprint — see ADR 0009 | DONE |
| F24 | **Bug:** at the top of the depth/relief/pulse sliders a field grew to fifteen units, closed over the camera and left the viewport flat grey | DONE |
| F25 | **Bug:** a tile size larger than the field size produced a single hidden tile, so the environment rendered nothing at all | DONE |
| F27 | **Bug:** the built room at a small Size rendered as scattered debris — its inward-facing walls were always closer than the camera, so every one was back-face culled. It now reaches at least past the framing distance | DONE |
| F28 | Contact-sheet harness (`scripts/shoot-matrix.mjs`) sweeping environments x cameras x device sizes x close details x every built-in preset into one reviewable PNG | DONE |
| F29 | Swept all twelve built-in presets after the plinth became visible, since every one of them was authored while it was not. No regressions: the studio looks gain a plinth, and the environment looks correctly disable it | DONE |
| F26 | **Bug:** the whole Scene tab crashed with "Maximum update depth exceeded" in any session with no screenshot uploaded — `mediaPalette` returned a fresh `[]` into a Zustand selector | DONE |

## Device realism

Found by sweeping the catalogue through `scripts/shoot-matrix.mjs` and looking
at the results, which is the only way these show up.

| # | Task | Status |
|---|---|---|
| R1 | **Bug:** the watch strap swept out and stopped, reading as two ribbons past the case. Both halves are now arcs of one fastened loop — see `spec/bandLoop.ts` | DONE |
| R15 | On-screen overlays converted to the ADR 0008 points model — home indicator, Android nav, status bar, menu bar and Dock, each against a reference screen chosen by device class rather than one screen scaled | DONE |
| R2 | Keyboard deck was five rows of identical keycaps. Now a real layout: wide space bar, stepped left edge, short function row, inverted-T arrows | DONE |
| R3 | **Bug:** the trackpad overhung the front edge of the laptop base, and the keyboard plane stretched its texture | DONE |
| R4 | Monitor and iMac stood on rectangular slabs — the stand radii were fixed millimetres, invisible on a 240mm foot. Now proportional | DONE |
| R8 | **Bug:** the screenshot texture had no mip chain, so fine UI text crawled at any angle; the Dock and menu bar were a third too large against a display no Mac has | DONE |
| R9 | **Bug:** applying a built-in look replaced the chosen device with the default phone, and carried over camera/plinth/shadow sized for it | DONE |
| R10 | Marketing screenshots now use the app's own pages as the on-device content, captured by `scripts/make-shot-fixtures.mjs` | DONE |
| R12 | **Bug:** an imported GLB showed the screenshot upside down — glTF's UV origin is the opposite of three.js's, and each path now states the convention it needs | DONE |
| R13 | **Bug:** a corrupt `.glb` passed the extension check and its loader rejection escaped as an unhandled page error. The header is read before the loader sees it | DONE |
| R11 | Toolbar toggle for the orientation gizmo — exports stripped it, but there was no way to get a clean viewport on screen | DONE |
| R7 | **Bug:** the contact shadow was drawn from below the floor, compressing into a grey streak past the product at Low hero and while orbiting under | DONE |
| R5 | Audit every catalogue spec against published dimensions. `spec/screenAspect.test.ts` cross-checks each screen's geometry against its published display aspect and caught seven | DONE |
| R6 | Speaker/mic cutouts, ports, MagSafe ring, laptop feet, fold and flip hinge crease — all spec fields (`edges`, `crease`, `magsafe`, `hinge.feet`), no bespoke geometry. Placement is checked arithmetically in `edgeCutouts.test.ts` because no camera preset in the app looks at a phone's bottom rail | DONE |
| R14 | **Bug, found and fixed: the plinth was never drawn.** Its material carried a `polygonOffset` — added to stop a starburst where the contact shadow met its cap — which pushes its rasterised depth away from the camera. Its top face is deliberately coplanar with the cyclorama floor (a device at y=0 rests on both), so that offset made the floor win the depth test everywhere and the plinth was invisible at every size, every colour and with any texture on it. Requirement C3 and the pedestal half of F16 were both silently non-functional. Fixed by ordering the three coplanar surfaces by offset — shadow 0, plinth 1, floor 2 — so the shadow still wins over the plinth and the plinth now wins over the floor. Two earlier hypotheses (contrast, then the R3F map-recompile) were wrong and are recorded as such in the commit history | DONE |

## UX and robustness

| # | Task | Status |
|---|---|---|
| U1 | React error boundary with a well-designed error screen, not the router's default | DONE |
| U2 | A proper 404 page | DONE |
| U3 | Empty states everywhere something can be empty | DONE |
| U4 | Keyboard shortcut reference / help overlay | DONE |
| U5 | Focus-visible styling audit across every interactive control | DONE |
| U6 | `prefers-reduced-motion` honoured by every animation | DONE |
| U7 | Toast/inline feedback when an action succeeds (export saved, preset applied) | DONE |
| U8 | Offline/local reassurance surfaced in the UI, not only in the docs | DONE |
| U9 | **Bug:** the /window tool opened on a large empty rectangle — no screenshot and no chrome means nothing to draw, and on a phone it filled the fold | DONE |
| U10 | Responsive sweep widened to both themes, a 360px phone, a laptop width, `/window` and the 404 — 90 checks, all clean | DONE |

## Theme — Horizon

The user has asked for the whole app to adopt the Horizon palette
(<https://github.com/jolaleye/horizon-theme-vscode>). **This supersedes the
earlier "cool blue/green" direction (S16)** — Horizon is a warm sunset palette,
so that instruction is now obsolete. Keep the earlier lessons that still apply:
no pure black or white, light/dark token parity, and every colour pair measured
for contrast rather than eyeballed.

| # | Task | Status |
|---|---|---|
| T1 | Adopt the Horizon palette across primitives and semantics, light and dark | DONE |
| T2 | Give the primary colour an accompanying shade for gradients | DONE |
| T3 | Use that gradient on primary buttons, toggle switches, cards, landing design | DONE — revised: buttons and toggle tracks are too small to show a ramp, so they take its midpoint (`--accent-solid`) and the gradient moved to surfaces with room for it — navbar rule, card borders, closing panel edge, loading bar, spinner arc, slider fills, page titles. See docs/reference/design-tokens.md#gradient |
| T4 | Reading pages: headings distinguished from body by colour and/or weight | DONE |
| T5 | Re-measure every contrast pair after the palette change | DONE |

## Deployment

| # | Task | Status |
|---|---|---|
| D1 | Production URL is `https://mockup-studio.anahatmudgal.com` — use it in README, docs, sitemap and canonical links | DONE |
| D2 | `vercel.json` — SPA rewrites so deep links work, plus sensible headers | DONE |
| D3 | Content-Security-Policy enforcing the local-only promise, tested against the real headers via `serve-deployed.mjs` | DONE |
| D4 | `verify-offline.mjs` — no request ever leaves the machine, measured across every route and a full studio session | DONE |
| D5 | `verify-csp.mjs` — the policy does not block the app, and its inline-script hash is current | DONE |
| D6 | CI workflow running `npm run verify` and `npm run build` on push and PR | DONE |
| D7 | GitHub issue templates, PR template, and a stronger trademark/attribution note | DONE |
| D8 | Code pushed to `origin/main` | DONE |
| D9 | **Build proven to deploy.** An anonymous `vercel deploy --temporary` served every route, the SPA rewrite, the CSP and the immutable asset caching correctly from real Vercel infrastructure; `verify:csp` and `verify:offline` both pass against a live deployment via `BASE_URL`. It found a genuine blocker on the way: a `"//"` comment key in `vercel.json` that Vercel rejects outright, which would have failed the first real deploy before it built anything | DONE |
| D10 | **BLOCKED — needs account access.** `mockup-studio.anahatmudgal.com` has no DNS record. `npx vercel login` is interactive and the CLI is not authenticated here. Three commands plus a Domains-tab entry — see `docs/reference/deployment.md` | BLOCKED |

## Competitive features

From shots.so (screenshot supplied by the user) and comparable tools. These are
things paid products do that we should match or beat.

| # | Task | Status |
|---|---|---|
| C1 | Container style presets: glass light/dark, inset light/dark, outline, border, liquid | DONE |
| C2 | Border shape control: sharp / curved / round, plus a radius slider | DONE |
| C3 | Shadow presets: none / spread / hug / adaptive, with an opacity slider | DONE |
| C4 | Layout preset gallery with live thumbnails, not just a names list | DONE |
| C5 | Multi-up layouts — 1, 2 or 3 devices in one composition | DONE |
| C6 | Separate Zoom and Tilt controls with a live preview | DONE |
| C7 | Undo / redo | DONE |
| C8 | "Start over" — reset the whole scene, behind a confirmation | DONE |
| C9 | Copy the export straight to the clipboard | DONE |
| C10 | Export scale selector shown inline on the export button (1x/2x/4x) | DONE |
| C11 | "Hide mockup" — render the screenshot on the backdrop with no device | DONE |
| C12 | Gradient backdrop presets that adapt to the uploaded media | DONE |
| C13 | Research pass: what else comparable tools offer that we lack | DONE |

## Project

| # | Task | Status |
|---|---|---|
| P1 | README in the `anahat-readme` house style (backlog #28) | DONE |
| P2 | Organise `docs/` into folders | DONE |
| P3 | Maintain this checklist as tasks arrive | ONGOING |
| P4 | Commit in stages as work lands | ONGOING |
| P6 | Reference AnahatM/sparkfile's info pages (fetch from GitHub — not present locally) | DONE |
| P5 | **FINAL PASS** — capture real screenshots for every placeholder slot across the whole site (landing hero, landing showcase ×3, About) and the README's image slots, then wire them in and delete the "coming soon" states. Do this last, once the UI has settled. `scripts/capture-shots.mjs` is the harness. | DONE |

## Standing constraints

These apply to every task above and are checked before each commit.

- No hardcoded CSS colours outside `src/styles/tokens/`.
- Everything themeable; both light and dark must stay at parity.
- 150 lines per file, 80 per function — extract rather than raise.
- Strict TypeScript; no `any`, no non-null assertions to silence the compiler.
- No network requests at runtime.
- DRY and modular; a new knob is a data change, not new JSX.
- `npm run verify` green before every commit.
