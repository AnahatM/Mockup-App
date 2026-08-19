# Architecture

## Guiding idea

The product promise is _control_, so the architecture is **data-driven end to end**:
devices are specs, control panels are schemas, and whole scenes are manifests. Adding a
device, a knob, or a preset should be a data change, not a code change. That is what keeps
files short, behaviour consistent, and the bug surface small.

## Layers

Dependencies point downward only. A lower layer never imports from a higher one.

```
app/        Layout and panel composition — knows about features
features/   Self-contained domain slices — know about state, ui, lib
state/      Zustand store, one slice per domain — knows about lib
ui/         Design-system primitives — pure presentation, no domain knowledge
lib/        Pure functions, React-free, unit-tested — knows about nothing
styles/     Tokens and global CSS
```

### `lib/` — the pure core

No React, no three.js objects, no DOM globals beyond what a function is explicitly handed.
Everything here is trivially unit-testable, and it is where the genuinely tricky logic
lives (superellipse geometry, colour maths, palette extraction). If a bug is subtle, it
belongs here where a test can pin it.

### `ui/` — the design system

Dumb, reusable primitives: `Panel`, `Slider`, `ColorField`, `Toggle`, and so on. Each is a
`Foo.tsx` plus a `Foo.module.css`. They know nothing about mockups; they could be lifted
into any other app. They consume semantic tokens exclusively.

### `ui/controls/` — schema-driven panels

The single most important structural decision in the app. A control is **data**:

```ts
{ kind: 'slider', label: 'Rim intensity', min: 0, max: 8, step: 0.1,
  select: (s) => s.lighting.rim.intensity,
  update: (d, v) => { d.lighting.rim.intensity = v } }
```

`<ControlList>` renders any array of these. The accessors are typed function pairs rather
than string paths, so renaming a store field is a **compile error**, not a runtime bug.

The payoff: a panel file is ~40 lines of declarations instead of ~400 lines of JSX, every
control gets consistent labelling, keyboard handling and focus behaviour for free, and
adding a new knob anywhere in the app is one line.

### `features/` — domain slices

Each feature owns its components, hooks, schema and internal helpers, and exposes a public
`index.ts` barrel. **Cross-feature imports must go through that barrel** — reaching into
`@/features/scene/Backdrop` is blocked by ESLint. This keeps refactors local: internals can
be reorganised freely as long as the barrel holds.

### `state/` — Zustand, sliced

One file per domain slice (`device`, `screen`, `camera`, `lighting`, `backdrop`,
`animation`, `exportCfg`, `ui`), composed in `store.ts`. Immer middleware makes the control
`update` functions read as direct mutation while staying immutable underneath.

## Cross-cutting decisions

### Zod is the single source of truth for configuration

Every piece of scene state has a Zod schema. The TypeScript types come from `z.infer`, the
store is typed from them, the preset manifest _is_ them, and imported JSON is validated
through them. One definition yields four guarantees, and — critically — makes importing an
untrusted preset file safe and versionable.

### Geometry is procedural, with a GLB escape hatch

```ts
type DeviceMeshSource =
  { kind: 'procedural' } | { kind: 'glb'; url: string; screenMesh: string }
```

Procedural geometry keeps the app fully local, keeps device colours _changeable_ (which the
colour-match feature depends on), and avoids licensing and trademark risk on a public repo.
The `glb` variant exists from day one so a hand-modelled asset can be dropped in later
without a refactor. See [`adr/0001-procedural-geometry.md`](../adr/0001-procedural-geometry.md).

### Screen content is a layer stack, not one texture

```
screen mesh
  base plane     image texture | video texture | solid | gradient
  overlay plane  status bar        (toggleable)
  overlay plane  gesture / nav bar (toggleable)
  overlay plane  macOS menu bar + dock (toggleable)
```

Overlays are `CanvasTexture` planes offset slightly in front, redrawn only when their config
changes. Two benefits: video playback costs nothing extra, and every per-device toggle works
identically for procedural and GLB devices because it never touches geometry.

### Lighting is parametric objects, not an HDRI

The studio environment is built from `<Lightformer>` panels driven by the store. This keeps
the app fully local (drei's built-in environment presets fetch from a CDN) and makes every
rim light and glow a live, colour-bindable knob.
See [`adr/0003-parametric-lighting.md`](../adr/0003-parametric-lighting.md).

### Tone mapping belongs to the composer, not the renderer

A trap worth knowing about, because it fails silently. three.js applies
`renderer.toneMapping` only on the final output pass. As soon as an
`EffectComposer` renders the scene into a render target, the renderer's tone
mapping is bypassed — so setting `gl.toneMapping` and `gl.toneMappingExposure`
appears to work, compiles fine, and does absolutely nothing.

`PostFx` therefore always mounts the composer and runs postprocessing's
`ToneMapping` effect **last**, with `gl.toneMapping = NoToneMapping`. The
exposure value is still written to the renderer, because three's ACES shader
chunk — which the effect reuses — reads it from the `toneMappingExposure`
uniform.

Running tone mapping last is also more correct: bloom then operates on real HDR
values rather than on already-clipped ones.

This was caught by measuring mean canvas luminance at two exposure settings
(`scripts/verify-exposure.mjs`) rather than by looking at it — the difference
was exactly 1.00x. Keep that script working.

## Enforced constraints

| Constraint                                       | Mechanism                                                                             | Fails via           |
| ------------------------------------------------ | ------------------------------------------------------------------------------------- | ------------------- |
| No hardcoded CSS colours outside the token layer | stylelint `color-no-hex`, `color-named`, `function-disallowed-list` + a path override | `npm run lint:css`  |
| Max 150 lines per file, 80 per function          | ESLint `max-lines`, `max-lines-per-function`                                          | `npm run lint`      |
| No deep cross-feature imports                    | ESLint `no-restricted-imports`                                                        | `npm run lint`      |
| Strict typing                                    | `tsconfig.app.json`                                                                   | `npm run typecheck` |

Both lint guards were verified to actually reject violations when they were introduced, not
merely assumed to work.

### One strictness flag we deliberately do not use

`noPropertyAccessFromIndexSignature` is **off**. CSS Modules are typed as an index
signature, so with that flag every `styles.panel` becomes `styles['panel']`. The trade was
not worth it. Every other strict option, including `noUncheckedIndexedAccess` and
`exactOptionalPropertyTypes`, is on.
