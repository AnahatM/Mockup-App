# Mockup Studio — Implementation Plan

## Context

`C:\Dev\MockupApp` is a pristine `npm create vite` scaffold (React 19.2 / Vite 8 / TS 6) named `mockup-studio`. Nothing has been installed (`node_modules` and lockfile absent), there are zero git commits, and every source file is stock template boilerplate.

We are building **Mockup Studio**: a free, open-source, fully-local web app where developers drop in a screenshot or screen recording of their product and get a photographic 3D mockup of it running on a real device — phones, flip phones, tablets, laptops, desktops, watches — inside a customizable 3D studio with parametric lighting, backdrops, camera presets, animation, and image/video export. Plus 2D "digital mockups" (macOS/browser window chrome with traffic lights).

**Why it's being built this way:** the whole value proposition is _control_. So the architecture is data-driven end to end — devices are specs, controls are schemas, scenes are manifests. Nothing is hardcoded, no server is involved, no asset licensing is inherited, and adding a device or a knob is a data change rather than a code change.

### Decisions locked with the user

| Decision       | Choice                                                                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 3D geometry    | **Procedural/parametric**, with a `mesh` discriminated union so any device can swap to a GLB later with no refactor                        |
| Styling        | **CSS Modules + 3-tier CSS custom-property tokens**; hex literals banned outside the token layer by lint                                   |
| Visual style   | **Minimalist "chalk" theme**, light/dark switchable — deliberately quiet UI so the product/render is the focus                             |
| Screen media   | Image **and video** upload (`VideoTexture`)                                                                                                |
| Motion         | Animation preset system **+ WebM recording** via `MediaRecorder`                                                                           |
| Stills         | PNG at 1x/2x/4x, transparent-background mode, platform size presets                                                                        |
| Device library | **Broad, ~14 devices** across phone/flip/fold/tablet/laptop/desktop/watch + 2D windows                                                     |
| Config         | Realtime panels, **preset save/load in localStorage**, premade presets, everything expressed as one shareable/importable **manifest file** |
| Delivery       | **Phased**, app typechecks and runs at the end of every phase, no stopping for approval between phases                                     |

---

## Architectural pillars

### 1. Zod schemas are the single source of truth for all config

Every piece of scene state has a Zod schema. TypeScript types come from `z.infer`. The store is typed from it, the manifest is validated by it, imported JSON is parsed through it, and localStorage rehydration goes through it. One definition, four guarantees.

```ts
// features/scene/schema.ts
export const lightingSchema = z.object({
  preset: z.enum(['studio', 'rim', 'dramatic', 'soft', 'neon', 'custom']),
  exposure: z.number().min(0).max(3),
  lights: z.array(lightformerSchema).max(8),
  bloom: bloomSchema,
})
export type LightingConfig = z.infer<typeof lightingSchema>
```

This is what makes untrusted preset import safe and makes schema versioning/migration a real, testable thing rather than a hope.

### 2. Control panels are generated from typed schemas, not hand-written

A control is data. It carries a _typed accessor pair_, not a string path — so a rename is a compile error, not a runtime bug.

```ts
// ui/controls/types.ts
type Control<S> =
  | { kind: 'slider'; label: string; min: number; max: number; step: number; unit?: string
      select: (s: S) => number; update: (d: Draft<S>, v: number) => void }
  | { kind: 'color'  | 'toggle' | 'select' | 'vec3' | 'angle'; ... }
  | { kind: 'group'; label: string; collapsed?: boolean; children: Control<S>[] }
```

`<ControlList schema={lightingControls} />` renders any of them. **Adding a new knob to the app is one line of data.** This is the single biggest lever for both "no long files" and "full customizability" — panel files stay ~40 lines of declarations instead of ~400 lines of JSX.

### 3. Procedural geometry with a GLB escape hatch

```ts
// features/devices/spec/types.ts
export type DeviceMeshSource =
  { kind: 'procedural' } | { kind: 'glb'; url: string; screenMesh: string }
```

`<Device>` switches on `spec.mesh.kind`. Procedural builders are pure functions returning `BufferGeometry`, unit-testable and cached by spec hash.

The core primitive is a **squircle** (superellipse) extrusion — the continuous-curvature corner is what makes a phone read as real rather than as a rounded box. Built once in `lib/math/squircle.ts` and reused by every body, screen, camera bump, and window frame in the app.

### 4. Screen content is a layer stack, not a texture

```
screen mesh
 └─ base plane      : image texture | video texture | solid | gradient
 └─ overlay plane   : status bar   (toggle, time/carrier/wifi/battery, light|dark)
 └─ overlay plane   : gesture bar / nav buttons (toggle)
 └─ overlay plane   : macOS dock / menu bar (toggle)
```

Overlays are `CanvasTexture` planes offset a hair in front — drawn only when their config changes (dirty flag), so video playback costs nothing extra. Crucially this makes every per-device toggle you asked for **independent of geometry**, so it works identically for procedural and GLB devices.

### 5. Lighting is parametric objects, not an HDRI file

The studio environment is `<Environment resolution={256}>` filled with `<Lightformer>` panels driven straight from the store — key strip, fill, top softbox, and user-addable rim lights each with shape/position/rotation/scale/color/intensity. Fully local (no CDN HDRI fetch), and every rim light and glow is a live knob that can be **color-matched to the user's brand palette**, which is extracted from their uploaded screenshot by a local median-cut in `lib/color/extract.ts` (~60 lines, no dependency).

### 6. Hard limits enforced by tooling, not discipline

- `eslint max-lines: 150` per file, `max-lines-per-function: 80` — "no long code files" becomes a build failure.
- Stylelint bans color literals (`#hex`, `rgb()`, `hsl()`, named colors) everywhere except `src/styles/tokens/**` — "no hardcoded CSS colors" becomes a build failure.
- `tsconfig` gets full strict plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `noImplicitReturns`.

---

## Dependencies to add (all pinned to current latest, verified compatible)

| Package                                   | Version | Purpose                                                                |
| ----------------------------------------- | ------- | ---------------------------------------------------------------------- |
| `three`                                   | 0.185.1 | 3D engine                                                              |
| `@react-three/fiber`                      | 9.7.0   | React renderer for three (React 19 compatible)                         |
| `@react-three/drei`                       | 10.7.8  | `Environment`, `Lightformer`, `ContactShadows`, `OrbitControls`        |
| `@react-three/postprocessing`             | 3.0.5   | Bloom / glow / vignette / DoF (peer floor is R3F ≥9.7.0 — exactly met) |
| `postprocessing`                          | 6.39.4  | required peer of the above                                             |
| `zustand`                                 | 5.0.15  | store, sliced per domain                                               |
| `immer`                                   | 11.1.18 | ergonomic immutable updates for control `update` fns                   |
| `zod`                                     | 4.4.3   | config schemas, manifest validation, import safety                     |
| `react-colorful`                          | 5.8.0   | color picker widget                                                    |
| `@types/three`                            | 0.185.4 | types (dev)                                                            |
| `stylelint` + `stylelint-config-standard` | 17.14.1 | enforce the no-literal-colors rule (dev)                               |
| `prettier`                                | latest  | formatting (dev)                                                       |
| `vitest` + `@vitest/coverage-v8`          | latest  | unit tests for pure `lib/` + schema migrations (dev)                   |

**Removed from the scaffold:** `@babel/core`, `@rolldown/plugin-babel`, `babel-plugin-react-compiler`, `@types/babel__core`. The React Compiler auto-memoizes aggressively, which fights R3F's deliberately mutation-heavy per-frame patterns, and it forces a Babel pass through an otherwise Rolldown-native Vite 8 build. Dropping it removes a real class of hard-to-debug render bugs and speeds the build. Recorded as an ADR.

`react`/`react-dom` pinned to `~19.2` — R3F 9's peer range is `>=19 <19.3`, so a caret range could drift out of support.

Node 22.14.0 / npm 10.9.2 already satisfy every floor; no runtime upgrade required.

---

## Target structure

```
src/
├─ main.tsx                 App bootstrap (~15 lines)
├─ App.tsx                  Providers + <AppShell/> only (~25 lines)
├─ styles/
│  ├─ reset.css
│  ├─ global.css
│  └─ tokens/  primitives.css · semantic.css · motion.css · index.css
├─ lib/                     Pure, React-free, unit-tested
│  ├─ math/     squircle.ts · rounded-rect.ts · lerp.ts · easing.ts
│  ├─ color/    convert.ts · extract.ts · contrast.ts
│  ├─ result.ts · id.ts · download.ts · dirty.ts
├─ types/                   Cross-domain shared types
├─ state/
│  ├─ store.ts              Composes slices
│  └─ slices/  device · screen · camera · lighting · backdrop
│               · animation · exportCfg · ui  (one file each)
├─ features/
│  ├─ theme/                ThemeProvider · useTheme · themes.ts
│  ├─ scene/                SceneCanvas · Stage · Backdrop · Pedestal · PostFX · schema
│  ├─ lighting/             LightformerRig · lights/ · presets.ts
│  ├─ devices/
│  │  ├─ spec/              types.ts · registry.ts · defaults.ts
│  │  ├─ builders/          body.ts · screen.ts · cameraBump.ts · buttons.ts
│  │  │                     · hinge.ts · band.ts · keyboard.ts   (pure geometry fns)
│  │  ├─ materials/         metal.ts · glass.ts · matte.ts · maps.ts (procedural textures)
│  │  ├─ catalog/           one file per device (~40 lines each)
│  │  └─ components/        Device · ProceduralDevice · GlbDevice · DeviceScreen
│  ├─ screen/               ScreenSurface · compositor.ts
│  │  └─ overlays/          StatusBar · GestureBar · Dock · MenuBar · Wallpaper
│  ├─ camera/               CameraRig · presets.ts · useOrbit.ts
│  ├─ animation/            clips/ · player.ts · useAnimationClock.ts
│  ├─ capture/              png.ts · webm.ts · sizePresets.ts · useCapture.ts
│  ├─ flat/                 MacWindow · BrowserWindow · TrafficLights · TitleBar
│  ├─ media/                Dropzone · useMediaSource · decode.ts
│  └─ presets/              manifest.ts (zod) · migrate.ts · storage.ts
│                           · io.ts · builtin/*.ts
├─ ui/                      Design-system primitives, each Foo.tsx + Foo.module.css
│  ├─ Panel · Field · Slider · NumberInput · ColorField · Select · Toggle
│  │  · SegmentedControl · Tabs · Accordion · Button · IconButton · Tooltip
│  │  · Dropzone · Vec3Field · EmptyState
│  └─ controls/             ControlList · control renderers · types.ts
└─ app/
   ├─ layout/               AppShell · Toolbar · Sidebar · Inspector · Viewport
   └─ panels/               Device · Screen · Camera · Lighting · Backdrop
                            · Animation · Export · Presets  (schema declarations)
```

---

## Roadmap

Each phase ends with `npm run typecheck && npm run lint && npm run build` green and the dev server rendering. I proceed through all phases without pausing.

### P0 — Clean slate, toolchain, tokens, docs

- Delete `src/App.tsx`, `src/App.css`, `src/assets/*`, `public/icons.svg`; replace `public/favicon.svg`; rewrite `index.html` (title, meta, theme-color, no-flash theme script).
- `npm install` + add all deps above; remove React Compiler plugin and its 4 devDeps; rewrite `vite.config.ts` with an `@/` alias.
- `tsconfig.app.json`: full strict set. Mirror the alias in `paths`.
- ESLint: add `max-lines`, `max-lines-per-function`, `@typescript-eslint/consistent-type-imports`, `no-restricted-imports` (block deep cross-feature imports — features talk through `index.ts` barrels only).
- Stylelint config with the color-literal ban.
- Scripts: `dev · build · preview · lint · lint:css · typecheck · format · test`.
- **Chalk token system**: `primitives.css` (warm-paper and soft-charcoal ramps, spacing, radii, type scale, elevation, motion) → `semantic.css` (`--surface-*`, `--text-*`, `--border-*`, `--accent-*`, `--control-*`) with `:root` = light and `[data-theme='dark']` overriding only semantics. No pure black or pure white anywhere; hairline borders; matte, near-shadowless.
- Docs scaffold: root `README.md` (OSS-facing), `LICENSE` (MIT), `CONTRIBUTING.md`, `CLAUDE.md`, `docs/architecture.md`, `docs/design-tokens.md`, `docs/device-specs.md`, `docs/preset-manifest.md`, `docs/adr/0001-procedural-geometry.md`, `docs/adr/0002-drop-react-compiler.md`.
- First git commit capturing the scaffold, then a second for the cleanup.

### P1 — App shell + UI primitives + theme

- `ThemeProvider` (light/dark/system, persisted, no FOUC), theme toggle.
- All `ui/` primitives with their CSS modules — built and visually verified before any feature consumes them.
- `ControlList` + every control renderer; this is the backbone all panels sit on.
- `AppShell`: quiet toolbar, left device rail, center viewport, right inspector with tabs. Resizable/collapsible panels.

### P2 — 3D scene foundation

- `SceneCanvas`: ACES tone mapping, sRGB output, `dpr [1,2]`, `alpha`, `preserveDrawingBuffer`.
- `LightformerRig` driven by the lighting store; `Environment` re-bakes on a config hash.
- Parametric `Backdrop`: transparent / solid / linear gradient / radial glow / studio cyclorama / grid — all token-independent and export-safe.
- `Pedestal` (toggleable), `ContactShadows`, `PostFX` (bloom, vignette, DoF, CA) all bound to store.
- Orbit controls + a placeholder device so the studio is inspectable immediately.

### P3 — Device spec system + procedural builders

- `DeviceSpec` type + zod schema + registry.
- `lib/math/squircle.ts` and the geometry builders (body, screen recess, camera bump, lenses, buttons, hinge, watch band, laptop base/keyboard/trackpad).
- Procedural materials: brushed-titanium / anodized-aluminum / polished-steel / matte-glass / gloss-glass, with roughness+normal+anisotropy maps generated on a canvas at runtime.
- First three devices: `iphone-pro`, `android-flagship`, `macbook-pro`. Device picker wired.

### P4 — Media pipeline

- Dropzone + file picker; image and video accepted; object-URL lifecycle correctly revoked.
- Image → texture (sRGB, max anisotropy, aspect fit/fill/stretch, offset/zoom).
- Video → `VideoTexture` with play/pause/loop/mute/seek/rate controls.
- Brand color extraction from the upload, surfaced as a swatch row that can be applied to lights, backdrop, or device body in one click.

### P5 — Screen overlay layers

- Compositor + `StatusBar` (time, carrier, signal, wifi, battery, light/dark, iOS vs Android styling), `GestureBar`, Android nav bar, macOS `MenuBar` + `Dock`, `Wallpaper` fallback.
- Per-device declared `supportedOverlays` so the panel only ever offers what makes sense for the selected device.

### P6 — Camera + lighting presets

- Camera presets: front, hero, three-quarter, top-down, low-hero, floating, dutch, macro-detail — each an FOV/position/target/roll set, smoothly interpolated.
- Lighting presets: studio, soft-box, rim-glow, dramatic, neon, product-white, moody — plus full manual control and add/remove/duplicate of individual lights.
- Glow/rim/bloom controls, brand-color binding.

### P7 — Animation + recording

- Clip system: orbit, float, hero-spin, tilt-in, parallax-reveal, pop-in, breathe — each with duration/easing/loop/delay/amplitude, composable on separate channels (camera vs object).
- Transport UI: play/pause/scrub/loop, deterministic clock.
- WebM recording via `canvas.captureStream()` + `MediaRecorder` (VP9), duration/fps/bitrate controls, auto-download.

### P8 — Export pipeline

- PNG at 1x/2x/4x: resize renderer → render → `toBlob` → restore, so quality is independent of window size.
- Transparent-background mode (scene background nulled, backdrop hidden).
- Size presets: App Store 6.7"/6.1", Play Store, Dribbble, OG image, X card, Product Hunt, 4K, custom.
- Copy-to-clipboard, filename templating.

### P9 — 2D digital mockups

- `MacWindow` (traffic lights, customizable title bar, inline/unified/transparent styles), `BrowserWindow` (tabs, URL bar, light/dark), plus a device frame.
- Auto color-match the chrome to the screenshot's extracted palette.
- Two consumption modes: **flat export** (pure DOM → PNG) and **as a screen source** fed into any 3D device — so a laptop can display a browser window mockup.

### P10 — Preset manifest system

- `MockupManifest` zod schema, versioned, with a migration chain (`migrate.ts`) so old presets never break.
- localStorage repository (save/load/rename/duplicate/delete), premade presets as typed builtin files.
- Export to `.mockup.json` (media optionally embedded as a data URL, or omitted for a light shareable file) and import with full validation + friendly error reporting via `Result`.
- URL-hash sharing for media-less presets.

### P11 — Full device library + polish

- Remaining catalog: `iphone-notch`, `flip-open`, `flip-closed`, `fold-open`, `tablet-pro`, `tablet-mini`, `macbook-air`, `laptop-generic`, `imac-style`, `monitor-27`, `watch-square`, `watch-round`.
- Keyboard shortcuts, undo/redo (zustand temporal), empty/loading/error states, `prefers-reduced-motion`, WebGL-unsupported fallback, a11y pass on all controls.
- Perf: geometry/material caching by spec hash, on-demand rendering when idle, lazy-loaded panels.
- README with feature list and usage; finalize all `docs/`.

---

## Critical files

New-file heavy by nature, but these are the ones that define the system and should be reviewed first:

- `src/styles/tokens/semantic.css` — the entire theming contract
- `src/ui/controls/types.ts` + `ControlList.tsx` — how every panel in the app is built
- `src/features/devices/spec/types.ts` — the `DeviceSpec` + `DeviceMeshSource` union
- `src/lib/math/squircle.ts` — the geometry primitive everything visual rests on
- `src/features/presets/manifest.ts` — the shareable file format and its versioning
- `src/features/lighting/LightformerRig.tsx` — parametric studio lighting
- `src/state/store.ts` — slice composition

Modified from scaffold: `package.json`, `vite.config.ts`, `tsconfig.app.json`, `eslint.config.js`, `index.html`, `src/main.tsx`. Deleted: `src/App.css`, `src/assets/*`, `public/icons.svg`.

---

## Verification

**Per phase:** `npm run typecheck && npm run lint && npm run lint:css && npm run build` must all pass, and `npm run dev` must render without console errors.

**Unit tests (vitest)** on the pure layer only, where they actually pay for themselves:

- `lib/math/squircle.ts` — point count, closure, symmetry, radius clamping
- `lib/color/*` — conversion round-trips, contrast ratios, extraction determinism
- `features/presets/migrate.ts` — every old manifest version migrates to current
- `features/presets/manifest.ts` — malformed/hostile JSON is rejected with a useful error

**End-to-end manual script** (run in-browser at the end, and I'll drive it with the Chrome tools to confirm):

1. Upload a screenshot → appears on the iPhone screen, correctly oriented, sharp.
2. Toggle Dynamic Island, status bar, gesture bar → each appears/disappears independently.
3. Switch device to MacBook, then flip phone → screen content persists across devices.
4. Apply a lighting preset, then drag a rim light's color → reflection on the rail updates live.
5. Click a brand swatch extracted from the upload → backdrop and rim light adopt it.
6. Play a hero-spin animation, record 5s → a `.webm` downloads and plays.
7. Export PNG at 4x with transparent background → alpha is genuinely transparent.
8. Save as preset, reload the page, load the preset → scene restores exactly.
9. Export the preset to JSON, hand-edit it to be invalid, re-import → rejected with a readable error, app does not crash.
10. Toggle light/dark theme → UI recolors, the 3D render does not change.
11. Upload an `.mp4` → plays on the device screen and records into the WebM.

**Guarantee checks:** `npx eslint . --rule max-lines` reports zero violations; `npm run lint:css` proves no color literal exists outside `src/styles/tokens/`.
