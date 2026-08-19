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
| Controls  | `--control-bg`, `--control-fg`, `--track-bg`, `--track-fill`, `--thumb-bg`                    |
| Status    | `--status-success`, `--status-warning`, `--status-danger`                                     |
| Elevation | `--shadow-panel`, `--shadow-popover`                                                          |
| Focus     | `--focus-ring`                                                                                |

## The chalk palette

The app is a _viewer for someone else's work_, so its own UI is deliberately quiet: matte,
warm-neutral, low-glare, and low-contrast enough to recede while still being readable.

**There is no pure white and no pure black anywhere.** Both read as harsh next to a rendered
3D product and pull the eye toward the interface instead of the render. Light mode is a warm
off-white paper ramp; dark mode is a warm charcoal ramp with dusted chalk text. The accent
is a muted dusty indigo — it marks state, it does not shout.

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

## Adding a token

- Reach for an existing semantic token first — a new one is usually a sign that an existing
  role fits.
- If a genuinely new _role_ exists, add it to **both** theme blocks in `semantic.css`. A
  token defined in only one theme is a bug that will surface as an invisible element.
- Only add a primitive if no existing ramp step works.
