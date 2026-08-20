# Design tokens and theming

## The rule

**A literal colour may appear only in `src/styles/tokens/`.** Everywhere else uses
`var(--semantic-token)`. This is enforced by stylelint, so a stray `#fff` in a component
fails `npm run lint:css`.

The point is not purity for its own sake. It is that a theme becomes a _data change_: to
add a theme you write one CSS block, and no component needs to be touched or even known
about.

## Three tiers

```
primitives.css   what a value IS      --paper-100, --ink-900, --accent-500, --space-4
      |
      v
semantic.css     what a value is FOR  --surface-panel, --text-muted, --border-subtle
      |
      v
Foo.module.css   component usage      background: var(--surface-panel)
```

**Components may only ever read tier 2.** Reaching past it to `--ink-900` would hardcode a
palette decision into a component and break theming, so treat tier 1 as private to
`semantic.css`.

### Tier 1 — primitives (`tokens/primitives.css`)

Context-free ramps and scales: the paper, ink, chalk and accent colour ramps, plus spacing,
radii, type sizes, weights, motion durations and easings, z-index layers, and layout
dimensions.

### Tier 2 — semantic (`tokens/semantic.css`)

Role-named tokens grouped by purpose:

| Group     | Examples                                                                                      |
| --------- | --------------------------------------------------------------------------------------------- |
| Surfaces  | `--surface-app`, `--surface-panel`, `--surface-raised`, `--surface-sunken`, `--surface-hover` |
| Text      | `--text-primary`, `--text-secondary`, `--text-muted`, `--text-disabled`, `--text-inverse`     |
| Borders   | `--border-subtle`, `--border-default`, `--border-strong`                                      |
| Accent    | `--accent`, `--accent-hover`, `--accent-soft`, `--accent-contrast`                            |
| Solid     | `--accent-solid`, `--accent-solid-hover` — the gradient's midpoint, for small controls        |
| Gradient  | `--gradient-primary`, and its `--gradient-from` / `--gradient-to` stops                       |
| Controls  | `--control-bg`, `--control-fg`, `--track-bg`, `--thumb-bg`                                    |
| Status    | `--status-success`, `--status-warning`, `--status-danger`                                     |
| Elevation | `--shadow-panel`, `--shadow-popover`                                                          |
| Focus     | `--focus-ring`                                                                                |

## The Horizon palette

The app is a _viewer for someone else's work_, so its own UI is deliberately quiet even
though the palette itself is vivid: the warm sunset accents mark state and draw the eye on
small elements (buttons, links, focus rings, gradients), while the large surfaces stay a
matte, warm-neutral field so the 3D render stays the focus.

The palette is adapted from [Horizon](https://github.com/jolaleye/horizon-theme-vscode),
a pink-to-peach sunset theme. **There is no pure white and no pure black anywhere** — both
read as harsh next to a rendered 3D product. Light ("bright") mode is a warm peach off-white
paper ramp; dark mode is Horizon's near-black UI-neutral ramp with warm chalk text. The
accent is Horizon's signature pink (`#e95678` dark / `#cb113b` light) — the near end of the
sunset gradient.

### How the ramps were built

`--paper-*` and the dark end of `--ink-*` (950-700) are Horizon's exact UI-neutral swatches.
Horizon supplied only one lighter dark-neutral anchor (`#6c6f93`) and four bright-neutral
anchors, which isn't enough steps for an 11-step `--ink-*` ramp or a 6-step `--paper-*` ramp,
so the remaining steps are generated with `mix()` from `src/lib/color/hex.ts` (a linear-light
blend, so darkening a colour does not skew its hue) — either interpolated between two Horizon
anchors or extrapolated a controlled distance past one. `--accent-*`, `--sunset-*` and the
status ramps (`--sage-*`, `--ochre-*`, `--clay-*`) follow the same rule: Horizon's exact
syntax/status swatches where one exists at the right lightness, `mix()`-derived steps where
none does. Every generated step was chosen by measuring contrast against the surfaces and
text it actually sits behind (see the token tests and the ratios recorded in the P7 change),
not by eye.

### Gradient

`--gradient-primary` is the sunset ramp as a ready-to-use `background`, defined once per
theme in `semantic.css` from the same accent primitive `--accent` resolves to, out to a
`--sunset-peach` (dark) or `--sunset-ember` (light) primitive stop. Its two ends are also
exposed on their own as `--gradient-from` and `--gradient-to`, because a component often
needs the ramp along its own axis rather than the canonical 135°: the loading bar sweeps it
horizontally, the spinner sweeps it around a circle, a slider lays it across the filled part
of its track. These are the only semantic tokens that reference other semantic tokens; the
tiering test in `tokens.test.ts` allows it precisely because both themes define them.

#### Where the ramp goes, and where it does not

**Not on small controls.** A 135° gradient across a 30px button or a 28×16px toggle track
traverses a few pixels of its own ramp, which does not read as a gradient — it reads as a
flat colour that is slightly wrong, and shifts as the element's width changes. Those take
`--accent-solid`, which is that theme's ramp sampled at its exact halfway point in sRGB
(the space the browser interpolates it in), with `--accent-solid-hover` a shade further
from the page — darker on paper, lighter on ink. Both are held to 4.5:1 against
`--accent-contrast` in `contrast.test.ts`.

**On anything long enough to show it**: the navbar's hairline, the top edge of the closing
panel, feature-card borders on hover, the loading bar, the spinner arc, slider fills, and
display type.

Painting text with the ramp goes through the global `.gradientText` class in
`styles/global.css`, never a per-page reimplementation — it carries the `-webkit-` fallback
pair, a `fit-content` box (the ramp is painted across the box, so a full-width heading would
show only its first inch), and a print override that puts real ink back, since a printer
does not paint backgrounds and the headline *is* its background. It is for **large text
only**: both stops are measured to 3:1, which is WCAG 1.4.3's threshold at 24px and up.
Below that size, `--text-accent` is the token to reach for.

## How theme switching works

`data-theme` on `<html>` is **always** an explicit `light` or `dark`.

1. A tiny blocking script in `index.html` runs before first paint. It reads
   `localStorage['mockup-studio:theme']`, falls back to `prefers-color-scheme`, and writes
   the resolved value. This is why there is no flash of the wrong theme.
2. After hydration, `features/theme` owns it. The user's choice is `light`, `dark`, or
   `system`; `system` is _resolved_ to one of the two rather than handled by a media query.

Resolving rather than media-querying keeps `semantic.css` free of duplicated dark blocks —
there is exactly one definition per theme.

## Adding a theme

1. Add a block to `semantic.css`:

   ```css
   [data-theme='sepia'] {
     color-scheme: light;
     --surface-app: var(--paper-200);
     --text-primary: var(--ink-800);
     /* ...override every semantic token... */
   }
   ```

2. Add the name to the theme union in `features/theme`.

That is the whole change. No component is modified, because no component knows a colour.

## Breakpoints

CSS media queries cannot read a custom property (`var()` is not valid inside a media
condition), so the breakpoint "scale" below is not a set of CSS variables — it is a fixed
set of literal values that every stylesheet in the app uses instead of inventing its own.
Treat this table as the source of truth; a new `@media` rule should hit one of these numbers
rather than a nearby one.

| Value             | Name      | Used for                                                                 |
| ----------------- | --------- | ------------------------------------------------------------------------- |
| `480px`           | `phone`   | Rare — only for a control that is still cramped at 640px.                 |
| `640px`           | `mobile`  | Navbar collapses brand+links+theme+source into a menu; studio toolbar wraps to multiple rows and drops its spacer; docs "Contents" rail becomes a collapsible disclosure. |
| `768px`           | `tablet`  | General reflow point for content grids that need it (most already use `auto-fit`/`auto-fill` and need no explicit rule). |
| `900px`           | `compact` | Studio: device rail and inspector switch from fixed columns to dismissible overlays; toolbar search hides; docs 3-column layout drops to 1 column. |
| `1088px` (`68rem`)| `wide`    | Landing hero drops from side-by-side to stacked/centred.                  |

Pick the smallest breakpoint that solves the problem, and prefer no breakpoint at all —
`auto-fit`/`auto-fill` grids, `flex-wrap`, `clamp()` and `minmax()` reflow themselves without
one. Reach for a breakpoint only when a layout has a genuine structural mode change (columns
becoming an overlay, a bar wrapping to multiple rows), not for fine-tuning spacing.

Touch-target sizing (icon buttons, the panel resize handles, sliders) is bumped with
`@media (pointer: coarse)` rather than a width breakpoint, since a touch-primary device is
what actually needs a bigger hit target, not a narrow viewport specifically — a touchscreen
laptop at 1440px wide needs the same bump a phone does.

## Adding a token

- Reach for an existing semantic token first — a new one is usually a sign that an existing
  role fits.
- If a genuinely new _role_ exists, add it to **both** theme blocks in `semantic.css`. A
  token defined in only one theme is a bug that will surface as an invisible element.
- Only add a primitive if no existing ramp step works.
