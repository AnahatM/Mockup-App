# Requirements Traceability

Every requirement stated by the project owner, mapped to the phase that delivers it and the
code that satisfies it. **Nothing may be dropped from this list.** If a requirement turns out
to be infeasible it gets a `BLOCKED` status and a written reason here — it never silently
disappears.

Status legend: `TODO` · `WIP` · `DONE` · `BLOCKED`

---

## A. Engineering standards

| #   | Requirement                                               | Delivered by                                                                                                      | Phase  | Status |
| --- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------ | ------ |
| A1  | React + Vite + TypeScript app                             | scaffold retained and upgraded                                                                                    | P0     | DONE   |
| A2  | Clean code patterns throughout                            | feature-sliced structure, pure `lib/`, barrel-only cross-feature imports                                          | all    | DONE   |
| A3  | Customizable themes                                       | `features/theme` + `[data-theme]` semantic token overrides                                                        | P0/P1  | DONE   |
| A4  | Consistent CSS tokens                                     | 3 tiers: `primitives.css` -> `semantic.css` -> component modules                                                  | P0     | DONE   |
| A5  | **No hardcoded CSS colors**                               | stylelint bans hex/rgb/hsl/named colors outside `src/styles/tokens/**`; build fails otherwise                     | P0     | DONE   |
| A6  | **No long code files**                                    | `eslint max-lines: 150`, `max-lines-per-function: 80`; build fails otherwise                                      | P0     | DONE   |
| A7  | Modular components for reuse, customizability, fewer bugs | `ui/` design-system primitives, schema-driven panels, pure geometry builders                                      | P1/P3  | DONE   |
| A8  | **Strict TypeScript**                                     | `strict` plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `noImplicitReturns` | P0     | DONE   |
| A9  | Clean up boilerplate, start from a clean state            | delete template `App.tsx`, `App.css`, `assets/`, `icons.svg`                                                      | P0     | DONE   |
| A10 | Document everything as we go                              | `docs/` plus ADRs plus per-feature READMEs, updated in the same commit as the code                                | all    | DONE   |
| A11 | Plan first, then implement                                | `docs/planning/PLAN.md`, approved before any code was written                                                              | pre-P0 | DONE   |
| A12 | Download all libraries needed                             | full 3D, state, and validation stack installed locally                                                            | P0     | DONE   |
| A13 | Use latest package versions where sensible                | all deps pinned to current latest; Node 22.14 already clears every floor                                          | P0     | DONE   |

## B. Product scope

| #   | Requirement                                                 | Delivered by                                                                                          | Phase  | Status |
| --- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------ | ------ |
| B1  | Mockup generator app                                        | the whole app                                                                                         | all    | DONE   |
| B2  | **Free and open source**                                    | MIT `LICENSE`, `CONTRIBUTING.md`, OSS-facing README                                                   | P0     | DONE   |
| B3  | Generate mockups of websites and apps across device formats | device catalog plus screen pipeline                                                                   | P3-P5  | DONE   |
| B4  | An all-in-one place for mockups                             | 3D devices, 2D window chrome, and export presets in one tool                                          | all    | DONE   |
| B5  | **Runs fully locally**, no server and no network calls      | procedural geometry, procedural lighting (no CDN HDRI), local file handling, localStorage persistence | all    | DONE   |
| B6  | Any type of mockup a user may want                          | broad catalog, custom device dimensions, GLB import seam                                              | P3/P11 | DONE   |

## C. 3D scene

| #   | Requirement                                                           | Delivered by                                                                                         | Phase | Status |
| --- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ----- | ------ |
| C1  | Full 3D space                                                         | `features/scene` R3F canvas                                                                          | P2    | DONE   |
| C2  | **Fully orbittable**                                                  | `OrbitControls` with damping, bound to the camera store                                              | P2    | DONE   |
| C3  | Central pedestal highlighting the product                             | `Pedestal` (toggleable) plus `ContactShadows`                                                        | P2    | DONE   |
| C4  | Parametric 3D background, customizable                                | `Backdrop`: transparent, solid, gradient, radial glow, cyclorama, grid                               | P2    | DONE   |
| C5  | Mostly blank and minimal by default                                   | default backdrop is a quiet studio sweep; chrome-free viewport                                       | P2    | DONE   |
| C6  | **Shiny lighting, rim lights, glows**                                 | `LightformerRig` parametric area lights plus bloom post-processing                                   | P2/P6 | DONE   |
| C7  | Color-match app theme colors to backdrop, lighting, glows, rim lights | `lib/color/extract.ts` median-cut palette from the upload, one-click bind to any color channel       | P4/P6 | DONE   |
| C8  | Lighting presets                                                      | `features/lighting/presets.ts`: studio, soft-box, rim-glow, dramatic, neon, product-white, moody     | P6    | DONE   |
| C9  | Camera presets                                                        | `features/camera/presets.ts`: front, hero, three-quarter, top-down, low-hero, floating, dutch, macro | P6    | DONE   |
| C10 | Animation presets                                                     | `features/animation/clips/`: orbit, float, hero-spin, tilt-in, parallax-reveal, pop-in, breathe      | P7    | DONE   |
| C11 | Full manual control over all of the above                             | schema-driven control panels for every parameter                                                     | P1-P7 | DONE   |

## D. Devices

| #   | Requirement                                                | Delivered by                                                                                     | Phase  | Status |
| --- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------ | ------ |
| D1  | 3D models of iPhones                                       | `catalog/iphone-pro.ts`, `catalog/iphone-notch.ts`                                               | P3/P11 | DONE   |
| D2  | Android phones                                             | `catalog/android-flagship.ts`                                                                    | P3     | DONE   |
| D3  | **Samsung flip phones**                                    | `catalog/flip-open.ts`, `flip-closed.ts`, `fold-open.ts` with a hinge builder                    | P11    | DONE   |
| D4  | MacBooks                                                   | `catalog/macbook-pro.ts`, `catalog/macbook-air.ts`                                               | P3/P11 | DONE   |
| D5  | Laptops (generic)                                          | `catalog/laptop-generic.ts`                                                                      | P11    | DONE   |
| D6  | Watches                                                    | `catalog/watch-square.ts`, `catalog/watch-round.ts`                                              | P11    | DONE   |
| D7  | Tablets and desktops (the "etc." in the brief)             | `tablet-pro`, `tablet-mini`, `imac-style`, `monitor-27`                                          | P11    | DONE   |
| D8  | **Textures on products**, aluminum and titanium side rails | `materials/` procedural brushed-metal roughness, normal, and anisotropy maps generated on canvas | P3     | DONE   |
| D9  | **Show the Dynamic Island / notch**                        | `builders/` cutout geometry, per-device and toggleable                                           | P3/P5  | DONE   |
| D10 | **Show camera bumps** with plateau, lenses, and rings      | `builders/cameraBump.ts`                                                                         | P3     | DONE   |
| D11 | **Show volume and side buttons**                           | `builders/buttons.ts`, placed from spec rail coordinates                                         | P3     | DONE   |
| D12 | Owner may supply real 3D assets later                      | `DeviceMeshSource` union with a `glb` variant; swap any device with no refactor                  | P3     | DONE   |

## E. Screen content

| #   | Requirement                                              | Delivered by                                                                         | Phase | Status |
| --- | -------------------------------------------------------- | ------------------------------------------------------------------------------------ | ----- | ------ |
| E1  | Upload a screenshot of an app, product, or website       | `features/media` dropzone plus file picker                                           | P4    | DONE   |
| E2  | **Upload a video file, used in place of a static image** | `VideoTexture` with play, pause, loop, mute, seek, and rate controls                 | P4    | DONE   |
| E3  | Screenshot maps correctly onto the device screen         | aspect fit, fill, stretch, offset, zoom                                              | P4    | DONE   |
| E4  | **Enable/disable the iPhone gesture bar**                | `overlays/GestureBar`                                                                | P5    | DONE   |
| E5  | **Enable/disable the time, wifi, and battery icons**     | `overlays/StatusBar`, iOS and Android styling, light/dark, editable time and carrier | P5    | DONE   |
| E6  | **Enable/disable the MacBook dock**                      | `overlays/Dock` plus `overlays/MenuBar`                                              | P5    | DONE   |
| E7  | Per-device toggles offer only what makes sense           | `spec.supportedOverlays` drives the panel                                            | P5    | DONE   |

## F. Digital (2D) mockups

| #   | Requirement                              | Delivered by                                                                   | Phase | Status |
| --- | ---------------------------------------- | ------------------------------------------------------------------------------ | ----- | ------ |
| F1  | Screenshot inside a **macOS window**     | `flat/MacWindow`                                                               | P9    | DONE   |
| F2  | **Traffic-light window controls**        | `flat/TrafficLights`                                                           | P9    | DONE   |
| F3  | **Customizable title bar**               | `flat/TitleBar`: text, alignment, height, style (inline, unified, transparent) | P9    | DONE   |
| F4  | **Color-matched** to the screenshot      | extracted palette auto-applied to the window chrome                            | P9    | DONE   |
| F5  | Browser window variant                   | `flat/BrowserWindow`: tabs, URL bar, light/dark                                | P9    | DONE   |
| F6  | Usable both flat and inside the 3D scene | flat PNG export, and usable as a screen source for any 3D device               | P9    | DONE   |

## G. Output

| #   | Requirement                   | Delivered by                                                                                                | Phase | Status |
| --- | ----------------------------- | ----------------------------------------------------------------------------------------------------------- | ----- | ------ |
| G1  | Export images for mockups     | `capture/png.ts` at 1x, 2x, 4x, resolution independent of window size                                       | P8    | DONE   |
| G2  | Transparent background export | scene background nulled and backdrop hidden, alpha preserved                                                | P8    | DONE   |
| G3  | Platform size presets         | App Store, Play Store, Dribbble, OG image, X card, Product Hunt, 4K, custom                                 | P8    | DONE   |
| G4  | **Record** animations         | `capture/webm.ts` using `captureStream` and `MediaRecorder` (VP9), with fps, duration, and bitrate controls | P7    | DONE   |

## H. Configuration and presets

| #   | Requirement                                               | Delivered by                                                                        | Phase | Status |
| --- | --------------------------------------------------------- | ----------------------------------------------------------------------------------- | ----- | ------ |
| H1  | **Configuration panel edited in realtime**                | schema-driven `ControlList`; every change is a live store write                     | P1    | DONE   |
| H2  | **Preset save/load in localStorage**                      | `presets/storage.ts`: save, load, rename, duplicate, delete                         | P10   | DONE   |
| H3  | **Premade presets**                                       | `presets/builtin/*.ts`, typed and schema-validated                                  | P10   | DONE   |
| H4  | **Manifest file system**, one file holds the whole config | `MockupManifest` zod schema, versioned                                              | P10   | DONE   |
| H5  | **Shareable**                                             | export to `.mockup.json`, plus URL-hash sharing for media-less presets              | P10   | DONE   |
| H6  | **Importable**                                            | validated import with friendly errors; invalid or hostile JSON cannot crash the app | P10   | DONE   |
| H7  | Presets survive schema changes                            | `presets/migrate.ts` version migration chain, unit-tested                           | P10   | DONE   |

## I. Look and feel

| #   | Requirement                                       | Delivered by                                                                                  | Phase | Status |
| --- | ------------------------------------------------- | --------------------------------------------------------------------------------------------- | ----- | ------ |
| I1  | **Minimalist** app style                          | quiet chrome, hairline borders, near-shadowless surfaces                                      | P0/P1 | DONE   |
| I2  | **Chalk theme**, light/dark switchable            | warm-paper and soft-charcoal ramps, with no pure black or pure white anywhere                 | P0/P1 | DONE   |
| I3  | **Focus off the app, on the product and visuals** | the viewport dominates, panels recede and collapse, and the UI theme never affects the render | P1    | DONE   |

---

## Deliberate decisions, recorded so they are not mistaken for omissions

- **Procedural geometry rather than bundled GLB models** — chosen for local-only operation,
  recolorability (which requirement C7 depends on), zero licensing and trademark risk on a
  public open-source repo, and a small repo. The `glb` seam (D12) ships from day one so real
  models can be dropped in later without a refactor.
  See `docs/adr/0001-procedural-geometry.md`.
- **React Compiler removed from the scaffold** — it auto-memoizes aggressively, which conflicts
  with React Three Fiber's deliberately mutation-heavy per-frame patterns, and it forces a Babel
  pass through an otherwise Rolldown-native Vite 8 build.
  See `docs/adr/0002-drop-react-compiler.md`.
- **Parametric `Lightformer` studio rather than an HDRI file** — satisfies C6 and C7 at the same
  time and keeps B5 (fully local) true, because drei's built-in environment presets fetch from
  a CDN.
  See `docs/adr/0003-parametric-lighting.md`.
- **Zod as the single source of truth for config** — one definition yields the TypeScript types,
  the store shape, the manifest format, and safe validation of untrusted imported JSON (H6).
  See `docs/adr/0004-zod-config-source-of-truth.md`.
