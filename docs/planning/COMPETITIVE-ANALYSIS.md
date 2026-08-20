# Competitive analysis

A gap analysis against paid mockup/device-render tools, done from a full read of this
repo's own feature inventory (README, `docs/planning/CHECKLIST.md`,
`docs/planning/REQUIREMENTS.md`, `docs/planning/BACKLOG.md`, the in-app user manual in
`src/content/docs/articles/`, every `src/features/*` barrel, and every panel in
`src/app/panels/`) plus targeted research into shots.so, Previewed, Rotato, Screen Studio,
Mockuuups Studio, Angle.sh, Artboard Studio, Smartmockups (now discontinued, folded into
Canva), CleanShot X, and open-source alternatives (AppScreen, mockupgen, themockitship).

This answers `CHECKLIST.md` item C13 ("research pass: what else comparable tools offer that
we lack").

**A note on the working tree at the time of writing:** several items `CHECKLIST.md` still
lists as `TODO` — C1 (container style presets), C2 (border shape), C3 (shadow presets), and
C11 (hide mockup) — are actually implemented in the current, uncommitted working tree
(`src/features/flat/schema.ts`, `containerLooks.ts`, `borderShapes.ts`, `shadowLooks.ts`,
`windowContainerControls.ts`). This document treats the code as ground truth, not the
checklist, and flags the discrepancy here so it isn't mistaken for this analysis being
wrong about what exists. `CHECKLIST.md` itself is out of scope for this document to edit.

---

## 1. What we already do well

The one structural fact that matters more than any single feature: **every competitor
researched is either a SaaS that renders on someone else's server, a downloadable template
library of pre-rendered images, or a native macOS recording tool.** None of them is a fully
local, live-parametric 3D renderer. That changes the shape of the comparison — some gaps
below are "they have a feature," but several of our strengths are "they cannot have this
feature without becoming a different kind of product."

| Where we already beat the paid tools | Detail |
| --- | --- |
| **Fully local, always** | No upload, no account, no server exists in this project at all (`docs/adr/0001…0004`). Every researched competitor is a hosted SaaS (shots.so, Previewed, Rotato, Mockuuups, ex-Smartmockups/Canva) or a native app that still phones a license server. |
| **No watermark, ever, on any tier** | Previewed's free "Lite" tier caps resolution at 720p and requires CC-attribution; Mockuuups' free tier requires attribution and is personal-use-only; Angle.sh's free tier is 50 mockups, personal use only; Rotato has no free tier at all. This app has one tier: everything, unlimited, forever. |
| **Live parametric 3D, not templates** | Mockuuups Studio, Artboard Studio, Angle.sh and ex-Smartmockups are all template compositors — a photographed or pre-rendered device image with a screen area you drop content into. None of them expose live material, lighting, or camera control. Rotato and Previewed do real 3D but through fixed device models and keyframed camera moves, not a from-scratch parametric material system. Our 10-finish material system (independently colourable frame/back/screen, `src/features/devices/materials/`), 7 lighting rigs + up to 8 manual lights + room fill + local HDRI loading (`src/features/lighting/`), and 9 spherical-offset camera presets that self-compose on any device size are deeper live control than anything found in research. |
| **Procedural device catalogue, freely recolourable** | 14 devices, each a data file in millimetres (`src/features/devices/catalog/`), each independently recolourable via colourway, free paint, or exact hex. Angle.sh charges $79 one-time (or $149 lifetime) for a *static* vector template library with no live recolouring at all. |
| **Container-style system already matches shots.so's headline feature** | `CONTAINER_STYLES` (default/glass-light/glass-dark/inset-light/inset-dark/outline/border), border-shape presets, and shadow presets (`src/features/flat/`) were built directly from a shots.so screenshot and already ship — this is C1–C3 done, one variant short of parity (see Gap G5). |
| **Postprocessing stack matches or beats a "premium" 3D competitor's marketing claims** | Depth of field/bokeh, bloom, ambient occlusion (N8AO), chromatic aberration and vignette all exist today (`src/features/scene/PostFx.tsx`). Rotato markets a "simulated DSLR lens" as a Premium-tier feature; we ship the equivalent as a free toggle. |
| **A real local preset/manifest ecosystem** | Versioned `MockupManifest` (Zod schema, source of truth), migration chain, save/load/rename/duplicate/delete in `localStorage`, JSON export/import, and URL-hash sharing for media-less presets (`src/features/presets/`, `docs/reference/preset-manifest.md`). Screen Studio has a comparable `.screenstudiopreset` file (validating this is a real market pattern), but no URL-hash sharing. |
| **A GLB/GLTF escape hatch for power users, for free** | `src/features/devices/glb/`, documented in `importing-models.md`: drop in any real 3D model with a screen-mesh picker, at no cost, versus paying for a static template library. |
| **Pro-tool UX polish no competitor markets** | Undo/redo scoped to scene changes only (`state/slices/history.ts`), a command palette searching every setting/device/preset/doc article (`Ctrl/Cmd+K`, `src/features/search/`), and a full keyboard-shortcut reference. None of the researched competitors' marketing or docs mention an equivalent settings-search or scene-undo model. |

---

## 2. Genuine gaps

Each entry: what it is, who has it, why a user wants it, difficulty *in this codebase*, and
whether it conflicts with the local-only constraint.

### Table-stakes gaps (competitors treat these as basic; we don't have them)

#### G1 — Multi-device compositions (1–3 devices in one scene)

- **What**: place more than one device in the same render — the classic "phone + watch"
  or "three phones fanned out" App Store hero shot.
- **Who has it**: shots.so (checklist item C5 was transcribed directly from a shots.so
  screenshot), Previewed's panoramic generator, Rotato (per aggregator summaries — not
  independently confirmed on Rotato's own features page), the open-source AppScreen.
- **Why a user wants it**: this is the single most common App Store / Play Store screenshot
  layout in the wild, and it's the type of shot our own device rail currently cannot produce
  at all.
- **Difficulty here**: **Large**. `Stage.tsx` renders exactly one `<Device />` inside one
  `<AnimatedProduct>` (confirmed by reading the file) — there is no array-of-placements
  concept anywhere in the store. This needs a new state shape (a list of device placements,
  each with its own spec/colour/materials/transform), a rewrite of `Stage.tsx` to map over
  it, and — the actually hard part — new camera-framing logic, since `frameDevice` and the
  spherical camera presets (`features/camera/presets.ts`) are built to frame *one* device's
  bounding size. This is a new rendering path, not a panel-schema entry.
- **Local-only conflict**: none. Pure client-side scene composition.

#### G2 — App Store screenshot mode: panoramic layout + headline text

- **What**: a dedicated mode that composes multiple devices with marketing headline/body
  text baked into the export, sized to store requirements.
- **Who has it**: Previewed's panoramic generator is the clearest reference — adjustable
  "partitions" controlling device count, free positioning/rotation per device, per-component
  colour, headline+body text in "100s of fonts," direct export at App Store dimensions. The
  open-source AppScreen does the 2D version of this with 1,500+ Google Fonts and localized
  text overlays.
- **Why a user wants it**: this is exactly the shot our own project's own backlog has been
  tracking since before this research (`BACKLOG.md` #25, `CHECKLIST.md` F3) — it's the
  actual top-of-funnel use case for "indie developer needs App Store screenshots."
- **Difficulty here**: **Large**, and depends on G1. Text compositing itself is a moderate
  addition (a new canvas-drawn layer, following the exact pattern `flat/draw/` already uses
  for window-chrome text) — except fonts must be bundled locally rather than pulled from
  Google Fonts the way AppScreen does, since a runtime font fetch is a network call this
  project's constraints forbid. Bundling even a small curated local font set is the correct
  local-only answer, but it's real added weight to a project that currently ships no fonts
  of its own.
- **Local-only conflict**: only if implemented the way AppScreen does it (CDN Google Fonts).
  A bundled local font subset avoids the conflict entirely.

#### G3 — Batch / multi-size export in one action

- **What**: generate the full required set of store sizes (e.g. iPhone 6.7", 6.1", iPad,
  Play Store) in one click instead of re-exporting per size.
- **Who has it**: Rotato's "App Store automation," the open-source AppScreen's ZIP batch
  export.
- **Why a user wants it**: store submissions need 3–6 specific sizes; re-running the export
  flow per size is the single most repetitive step in the current workflow, and this app
  already has every one of those sizes as a preset (`SIZE_PRESETS`, `exportControls.ts`) —
  it just runs them one at a time.
- **Difficulty here**: **Medium**. The hard part (rendering at an arbitrary resolution
  independent of window size) already exists in `features/capture/png.ts`. This is mostly
  "loop the existing export over a chosen subset of `SIZE_PRESETS`" plus a way to hand the
  user more than one file — either sequential downloads (trivial, if browsers tolerate
  multiple simultaneous downloads without a permission prompt) or a client-side ZIP (a
  small, fully-local, no-network dependency like JSZip).
- **Local-only conflict**: none.

#### G4 — Preset gallery with live thumbnails

- **What**: the Presets tab shows a visual thumbnail per look, not just a name and one-line
  description.
- **Who has it**: this is checklist item C4, transcribed from shots.so; the pattern is also
  standard across Mockuuups, Artboard Studio, and Angle.sh, whose entire product *is* a
  visual template gallery.
- **Why a user wants it**: choosing between twelve presets by reading descriptions
  ("Dark hero" vs "Rim metal") is strictly worse than seeing them, especially once there are
  more than twelve.
- **Difficulty here**: **Medium**. Confirmed by reading `PresetsPanel.tsx`: presets today are
  plain text buttons with no visual. The capture pipeline to render a thumbnail already
  exists (`features/capture/renderStill.ts`); the work is orchestrating an offscreen
  render per built-in preset (swap store state, capture at low res, restore, cache as a data
  URL) without disturbing the user's live scene — bounded, but not a one-line change.
- **Local-only conflict**: none — everything renders in-browser already.

#### G5 — "Liquid Glass" container style

- **What**: shots.so's container-style set is Default / Glass Light / Glass Dark /
  **Liquid Glass** / Inset Light / Inset Dark / Outline / Border. This project's
  `CONTAINER_STYLES` union (`src/features/flat/schema.ts`) has every one of those *except*
  Liquid Glass.
- **Who has it**: shots.so (confirmed on their marketing site; their pricing/gating for it
  could not be independently verified — their pricing page did not load).
- **Why a user wants it**: it's the one style in the checklist's own source screenshot that
  didn't make it into the implementation — closing it finishes a feature this project
  already decided to build.
- **Difficulty here**: **Trivial**. One more entry in `CONTAINER_STYLES`, one more
  `ContainerLook` record in `containerLooks.ts` (`chromeOpacity`/`sheenOpacity`/etc., the
  same approximation approach already used for `glass-light`/`glass-dark`), one label in
  `windowContainerControls.ts`. Textbook "one entry in a panel schema."
- **Local-only conflict**: none.

#### G6 — MP4 export alongside WebM

- **What**: video export in a second, more widely-accepted container/codec.
- **Who has it**: Rotato (H.264/HEVC, ProRes4444), Previewed (MP4 explicitly), Artboard
  Studio (MP4/WEBM).
- **Why a user wants it**: WebM alone is a real adoption ceiling, not a nice-to-have — X/
  Twitter's and LinkedIn's native video upload and Apple's App Store Connect preview uploads
  all expect MP4/MOV/M4V, and a WebM-only export will silently fail or get rejected in those
  flows. `features/capture/webm.ts` currently only ever produces `video/webm`
  (`RECORD_MIME_TYPES` lists only `vp9`/`vp8`/plain `webm` — confirmed by reading the file).
- **Difficulty here**: **Medium–Large**. Not achievable by adding a MIME type to
  `MediaRecorder` — Chromium's recorder does not offer an MP4/H.264 container option. The
  local-only-compatible path is `WebCodecs` (native browser API, no network, no wasm) to
  encode H.264 frames plus a small local muxer library (e.g. `mp4-muxer`) to box them — a
  genuinely new capture path alongside the existing `MediaRecorder`-based one, not an
  extension of it.
- **Local-only conflict**: none, as long as the encoder is `WebCodecs` (built into the
  browser) rather than a fetched/CDN encoder. Browser support for `WebCodecs` H.264 encoding
  should be spot-checked before committing to this.

#### G6b — Zoom/Tilt on the flat (2D) window composition

- **What**: checklist C6 ("separate Zoom and Tilt controls with a live preview," from
  shots.so). For 3D devices this already exists in substance — Turn/Tilt/Roll placement
  controls are documented in `devices.md` and implemented in `devicePlacementControls.ts` —
  but the flat/2D window mockup (`features/flat/`) has no equivalent perspective or zoom
  control; it only offers margin, corner radius and shadow geometry.
- **Who has it**: shots.so, for its 2D compositions specifically.
- **Difficulty here**: **Small**. Two more sliders in `windowContainerControls.ts` (a scale
  factor and a 2D skew/rotation applied at draw time in `flat/compose.ts`), following the
  same pattern as every other flat control.
- **Local-only conflict**: none.

### Differentiators (opportunities beyond parity, well-suited to this architecture)

#### G7 — Animated screen content (keyframed pan/zoom on the screenshot itself)

- **What**: today, `Screen → Zoom/Pan` (documented in `screen-content.md`) is a static crop.
  Screen Studio's whole value proposition is auto-zooming *into* screen content over time as
  a recording plays. No researched competitor does the equivalent for a screen rendered onto
  a 3D device — Screen Studio does it flat, in 2D, as an editing tool, not as a mockup
  feature.
- **Why build it**: this app already has an animation-clip system (`features/animation/`,
  8 clips) that drives camera/device transforms over time. Extending the same keyframe
  machinery to drive the screen content's zoom/pan over the clip's duration is a genuinely
  novel combination — "Ken Burns on your screenshot, on a rotating 3D phone" — that nobody
  in the researched set offers.
- **Difficulty here**: **Medium**. The animation architecture (interpolation, easing,
  duration/amount) already exists and generalises; the work is wiring a new animatable
  target (screen zoom/pan) into it rather than inventing a new system.
- **Local-only conflict**: none.

#### G8 — One-click "Clay" material mode

- **What**: strip every device's material to a single neutral matte finish for a
  silhouette-forward hero shot, with one toggle.
- **Who has it**: Rotato ("Clay mode," used to de-emphasise reflections and focus on form).
- **Difficulty here**: **Trivial–Small**. This app's material system (`FinishMaterial.tsx`)
  already resolves a finish per surface; a scene-level "Clay" override that all
  `FinishMaterial` instances check first is a small, additive change, not a new system.
- **Local-only conflict**: none.

#### G9 — "Auto style" backdrop/lighting suggestion from the uploaded image

- **What**: shots.so's "Magic backgrounds" auto-generate a background scene from the
  uploaded image; checklist C12 ("gradient backdrop presets that adapt to the uploaded
  media") is the same idea, unbuilt. A true generative-AI version is out of scope (see §4),
  but a **heuristic** version is not: this app already extracts a dominant palette from the
  upload (`lib/color/extract.ts`) and lets the user manually bind it to backdrop/rim/body/
  plinth. A one-click "Auto style" that picks a backdrop mode + applies the extracted
  palette + selects a complementary lighting rig automatically is a legitimate, honest
  approximation of the competitor feature without a generative model.
- **Difficulty here**: **Medium** — no new primitives, just an orchestration function that
  calls the existing palette extractor and existing control `update` functions in sequence
  with a chosen heuristic.
- **Local-only conflict**: none — this is explicitly the non-AI, local-only version of the
  feature.

#### G10 — Optional self-branding watermark on export

- **What**: shots.so sells "custom watermark" as a paid feature — letting *the user* stamp
  their own logo/handle onto exports (distinct from a forced platform watermark, which this
  app rightly never has).
- **Why build it**: some users voluntarily want their own mark on a shared mockup (portfolio
  pieces, social posts); it costs them nothing here and reinforces "no forced watermark, but
  you can add your own for free" as a talking point against paid tools that charge for it.
- **Difficulty here**: **Small**. One more compositing layer in the export path using a
  locally-selected image file, no different in kind from how the screen texture itself is
  composited.
- **Local-only conflict**: none — the logo is a local file the user supplies, never fetched.

#### G11 — Installable, offline-capable app shell (PWA)

- **What**: a web app manifest + service worker that precaches the app shell so it installs
  and opens with zero network activity, including offline.
- **Who has it**: not a competitor feature — none of the researched tools are installable
  local-first web apps, since they're all SaaS. This is listed as a differentiator, not a
  parity item, because it's a natural extension of a claim this project already makes.
- **Why build it**: "fully local, no server" is currently a promise you have to trust; an
  app that visibly still works with the network off is a materially stronger version of the
  same claim, for very little cost.
- **Difficulty here**: **Small**. A manifest file and a service worker that precaches the
  built assets (this is *not* a network call at runtime — it's caching what already shipped
  locally). No architectural change to the app itself.
- **Local-only conflict**: none — this is the local-only story made literal.

### Flagged, not recommended yet (high uncertainty or low ratio of value to effort)

#### G12 — Transparent (alpha) video export

- **What**: video export with a genuine alpha channel, so an exported clip can be composited
  like the existing transparent PNG export.
- **Who has it**: Rotato claims WebM-with-transparency and ProRes4444 with alpha.
- **Difficulty here**: **Large, and uncertain**. `Canvas.captureStream()` (what
  `features/capture/webm.ts` uses today) composites to opaque RGB before `MediaRecorder` ever
  sees it — there is no alpha in that pipeline, full stop. Getting real alpha would mean
  abandoning `MediaRecorder` for a `WebCodecs`-based frame-by-frame VP9/AV1 encode with
  alpha planes, which is a materially different, more complex capture path than G6's MP4
  work and has thinner browser support. Recommend a small research spike before committing
  engineering time, not a straight build.
- **Local-only conflict**: none, but flagged for cost/uncertainty, not architecture.

---

## 3. Prioritised recommendation

Ordered by (competitive exposure) × (how cheaply this architecture can deliver it), most
opinionated first:

1. **Multi-device layouts + App Store screenshot mode + batch export (G1 → G2 → G3), as one
   connected initiative.** This is table stakes, it's the single feature type most likely to
   be the actual reason a target user (an indie dev prepping a store listing) bounces off
   this app today, and it's already been sitting in this project's own backlog (`BACKLOG.md`
   #25, `CHECKLIST.md` F3/C5) independent of this research. Build multi-device placement
   state first — everything else (panoramic layout, headline text, batch export) is
   downstream of having more than one device in a scene at all. This is also the largest
   single piece of engineering in this list; scope it as its own phase rather than folding
   it into ongoing panel work.

2. **Close out the shots.so-derived checklist cheaply: G5 (Liquid Glass), G4 (preset
   thumbnails), G6b (flat zoom/tilt).** These are the remaining gaps from the project's own
   C1–C13 list that are genuinely inexpensive — G5 is literally a data entry, G6b is two
   sliders, G4 is bounded orchestration work reusing an existing capture function. Doing
   these finishes a body of work already 80% complete rather than opening something new.

3. **MP4 export (G6).** Rank this above its difficulty would otherwise suggest: WebM-only
   video is a silent adoption ceiling, not a missing nice-to-have — creators posting to X,
   LinkedIn, or submitting an App Store Connect preview need MP4 specifically, and right now
   this app cannot produce it at all. Scope it as `WebCodecs` + a local muxer, as a new
   capture path alongside the existing recorder rather than a patch to it.

4. **Animated screen content (G7).** The best "nobody else does this" opportunity found —
   it's a genuine combination of two systems this app already has (screen fitting +
   keyframed animation) that no competitor, including the screen-recording-specific tools,
   offers together. Medium effort, high differentiation.

5. **Small polish differentiators as capacity allows: G8 (Clay mode), G9 (Auto style), G10
   (optional watermark), G11 (PWA shell).** None of these are urgent, all are cheap relative
   to their payoff, and none compete for the same architecture surface as items 1–4, so they
   can be picked up opportunistically between larger phases.

6. **Spike G12 (transparent video) before scheduling it as real work.** Confirm feasibility
   and rough browser-support ceiling with a throwaway `WebCodecs` prototype before it goes on
   a roadmap — it's plausible this turns out to be materially harder than G6 for a feature
   with a narrower audience than G6's plain MP4 export.

**Distinguishing the buckets, explicitly:**

- **Table stakes we're missing**: G1, G2, G3, G4, G5, G6, G6b.
- **Differentiators**: G7, G8, G9, G10, G11.
- **Not worth prioritising yet**: G12 (real value, but high cost and uncertainty relative to
  everything above it).

---

## 4. Explicitly out of scope

Competitor features deliberately **not** recommended, with the architectural or product
reason each one is excluded:

| Feature | Who has it | Why it's out |
| --- | --- | --- |
| **Live screenshot capture from a URL** | Mockuuups Studio (capture a screenshot directly from a live URL) | Requires fetching and rendering a remote page — a network request at runtime, and most sites cannot be rendered by a page running inside a sandboxed tab anyway (CORS, JS execution). Directly violates the fully-local constraint (`docs/adr` and README: "There is no server in this project at all"). |
| **Generative-AI backgrounds / text-to-mockup generation** | shots.so ("Magic backgrounds"), Artboard Studio (AI mockup generator) | A real generative model either runs on a remote API (a network call at runtime, explicitly forbidden) or ships a multi-gigabyte model client-side, which is disproportionate to a small local app and would balloon the bundle this project has deliberately kept small. G9 (auto-style from the extracted palette) is the honest, local-only substitute — recommended above instead. |
| **Live device-over-USB mirroring** | Rotato (mirrors and records directly from a physically connected iPhone) | Needs native USB/driver access no browser web app can obtain; would require shipping this as a native/Electron app, which is a different product with a different distribution and update story than "open a URL, nothing installs." |
| **Team workspaces, seat-based billing, SSO, shared template libraries** | Mockuuups Studio (Team tier: SAML SSO, seat management, invoicing) | All require an account and a server to hold shared state — the two things this project's core promise ("no account, no upload") explicitly excludes. A preset `.mockup.json` file already covers the legitimate part of "share a look with someone." |
| **Licensed, patent-encumbered video codecs (ProRes4444, HEVC with alpha)** | Rotato Premium tier | Not implementable through open web APIs without a licensed encoder; even where technically reachable, redistributing or bundling such an encoder in an open-source project raises licensing risk disproportionate to the feature's value. Plain H.264 MP4 (G6) captures the real-world "it needs to open everywhere" need without this. |
| **Lottie/vector animation export** | Rotato | A fundamentally different rendering paradigm (a vector keyframe timeline) from this app's WebGL raster scene — would mean building and maintaining a second, parallel export representation of every animatable property for a niche use case (web animation embeds). Low value relative to the size of that undertaking. |
| **Attribution-required or capped free tiers, paid watermark removal** | Previewed (Lite tier: 720p cap, CC-attribution), Mockuuups (free tier: attribution required), Angle.sh (free tier: personal use only) | Not a feature gap at all — this is the competitors' business model, and this project's entire premise is not having one. Listed here only to be explicit that "match what they gate behind payment" was considered and rejected on principle, not overlooked. |

---

## Sources

- shots.so — https://shots.so (pricing page could not be loaded; feature claims only, gating unverified)
- shots.so terms (tier names referenced) — https://shots.so/terms
- Previewed — https://previewed.app/plans/, https://previewed.app/app-store-screenshot-generator/
- Rotato — https://rotato.app/features, https://rotato.app/pricing
- Screen Studio — https://screen.studio/changelog, https://hub.screen.studio/roadmap, https://hub.screen.studio/p/ipad-mockup-presets, https://hub.screen.studio/p/ability-to-make-camera-biggersmaller-in-post-edit-and-move
- Screen Studio pricing (third-party aggregation, approximate) — https://matte.app/blog/screen-studio-review
- Mockuuups Studio — https://mockuuups.studio/pricing/
- Angle.sh — https://angle.sh/pricing/, https://www.88.design/tools/angle
- Artboard Studio — https://artboard.studio/, pricing via https://omr.com/en/reviews/product/artboard-studio/pricing
- Smartmockups (discontinued, folded into Canva) — https://www.canva.com/help/smartmockups-closure/, https://www.crunchbase.com/acquisition/canva-acquires-smartmockups--b2305a14
- CleanShot X — https://cleanshot.com/features, https://cleanshot.com/
- AppScreen (open source) — https://github.com/YUZU-Hub/appscreen
- mockupgen (open source) — https://github.com/rmenon1008/mockupgen
- themockitship (open source) — https://github.com/jessekorzan/themockitship

Several sources above (shots.so pricing, Rotato multi-device-scene support, Screen Studio's
marketing-page feature list beyond its own changelog/hub, CleanShot X's browser-chrome
framing) are noted inline as unverified or lower-confidence where the primary source could
not be loaded or a claim came only from a third-party aggregator.
