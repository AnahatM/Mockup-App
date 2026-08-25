# ADR 0006 — The 2D mockup tools get their own route

**Status:** accepted
**Date:** 2026-08-19

## Context

The app grew as one tool: a 3D studio, with the 2D window mockup added later as
a tab inside it. That placement was historical rather than considered.

The 2D window mockup is drawn by `composeWindow` in `src/features/flat/` — a
pure Canvas 2D compositor. It takes a config, an image and a set of dimensions,
and returns pixels. It has no dependency on WebGL, on three.js, on the device
catalogue, on the lighting rig, or on the camera. The *only* reason it lived
inside the 3D studio was that the studio was the only place to put it.

That had three consequences:

1. **Cost.** Opening the app to draw a browser window around a screenshot
   loaded the entire 3D stack — three.js, react-three-fiber, drei, the
   postprocessing chain, fifteen device specs — and waited for shader
   compilation, for a feature that needed none of it.
2. **Availability.** On hardware or in a browser where WebGL is unavailable,
   the app fell back to a "3D is unavailable" screen. The 2D tools would have
   worked perfectly, and were unreachable.
3. **Discoverability.** Someone who wants a macOS window around a screenshot
   does not think of themselves as wanting a 3D studio, and would not look
   inside one.

## Decision

The 2D tools get their own route and page, separate from `/studio`.

The 3D studio keeps its window-mockup tab — the same controls and the same
preview component, mounted in two places rather than implemented twice — because
a window mockup displayed on a laptop screen inside the 3D scene is a real and
useful thing. What changes is that the 2D path is no longer *only* reachable
through the 3D one.

## Consequences

- The 2D tool loads without the 3D stack, and works with WebGL unavailable.
  This is the concrete test of whether the separation is real; if the 2D page
  ever starts pulling in three.js, the separation has silently regressed and is
  worth catching.
- The compositor must stay free of 3D dependencies. It already is, and this is
  now a property to maintain rather than an accident.
- One drawing path serves the live preview, the device-screen texture and the
  PNG export, so what the preview shows is what the export writes. Adding a
  second path for the preview would have been the easy mistake here.
- The site has two tools rather than one, so navigation, the sitemap and the
  landing page all have to say so. The route table is the single source those
  read from, and a test holds it against the router.

## Measured outcome

Transferred JavaScript per route, gzipped, before and after:

| Route | Before | After |
| --- | --- | --- |
| `/` | ~630 kB | 213 kB |
| `/docs` | ~630 kB | 213 kB |
| `/window` | ~630 kB | 320 kB (see the postscript — this number was wrong) |
| `/studio` | ~630 kB | 638 kB |

Getting there took two distinct fixes, and only the first was the one this ADR
predicted.

**Source coupling.** Store slices imported feature *barrels*, and those barrels
re-export react-three-fiber components — so every component, by touching the
store, pulled in three.js. Fixed with a `state.ts` convention: each feature may
expose its pure data-and-maths half, which the store imports instead. The worst
single instance was `camera/presets.ts` importing `frameDevice` from the devices
barrel, which put the entire 3D engine on the landing page for the sake of one
function.

**Chunking.** A hand-written `manualChunks` predated the lazy routes and fought
them: React's own files were being assigned into the `r3f` vendor chunk, so the
React chunk imported the 3D chunk and every route downloaded three.js purely to
get React. Removing it entirely — letting the bundler split on the router's own
dynamic-import boundaries — was the fix.

Both are guarded: `scripts/verify-eager-graph.mjs` walks static imports from the
entry and fails if anything reachable before a lazy boundary imports three.js;
`scripts/verify-bundle.mjs` measures bytes actually transferred per route.

Two guards rather than one because each caught the other lying. The bundle probe
originally matched on chunk *filenames*, which produced a false positive for
five rounds (the flagged chunk was mostly React) and then a false negative (after
the rename there was no such filename, so it passed while the studio still
loaded three.js). The graph walker's first version excluded newlines from its
import pattern, so it missed every multi-line `import { … } from 'three'` and
declared a graph clean that plainly was not. Neither error was visible from
inside the check that made it.

## Postscript, 2026-08-25 — the 2D route was still downloading three.js

The 320 kB recorded for `/window` above was not the 2D tool being 2D. Of the
`flat` chunk's 406 kB, **362 kB was three.js** — 96% of a chunk that exists
specifically to hold a Canvas 2D compositor.

The cause was the failure mode this ADR already names, in a place it had not
been looked for. `FlatStudio.tsx` imports `Dropzone` and `RecentUploads` from
the `@/features/media` barrel, and that barrel re-exported `useScreenTexture`,
which imports three.js. The store had been fixed with the `state.ts` convention;
the 2D tool's own component imports had not, and nothing was looking.

`useScreenTexture` now lives in `features/screen`, beside `useFramedTexture` and
`useOverlayTexture` — the feature that already owns the three.js texture hooks,
and whose barrel its only consumer (`devices/components/Device.tsx`) already
imported. `features/media` is now free of three.js entirely.

Measured before and after, transferred and gzipped:

| Route | Before | After |
| --- | --- | --- |
| `/` | 217 kB | 217 kB |
| `/docs` | 217 kB | 217 kB |
| `/window` | 325 kB | **228 kB** |
| `/studio` | 650 kB | 647 kB |

`/studio` is unchanged because it was downloading those bytes either way; they
have simply moved into the chunk that honestly owns them. `StudioPage-*.js` grew
from 1,061 kB to 1,431 kB for that reason and for no other — the studio was
always this size, and 370 kB of it was being billed to the 2D tool.

### Why it survived two guards

Neither guard was wrong. Neither asserted anything.

`verify-eager-graph.mjs` walks the graph *before the first lazy boundary*, and
`flat` is behind one, so this was outside what it looks at, correctly.
`verify-bundle.mjs` measured `/window` at 325 kB and printed it. The number was
transcribed into the table at the top of this ADR and read by everyone who has
read this document since. A check that reports rather than fails is a check that
delegates the decision to whoever happens to be reading, and here nobody was.

`verify-bundle.mjs` now carries per-route budgets and exits non-zero when one is
breached. `/window`'s is 260 kB: comfortably above the 228 kB it costs today,
comfortably below the ~325 kB it costs the moment three.js returns. Verified by
reverting the fix and confirming the check fails with the pre-fix build.

The studio's own size was reviewed at the same time and deliberately left alone;
the reasoning is written out in `vite.config.ts` beside the warning threshold.

## Alternatives considered

- **A modal inside the studio.** The first plan, and the user's initial
  suggestion. Rejected once the reasoning above was written down: a modal would
  have fixed the preview problem but none of the cost, availability or
  discoverability ones, because the studio would still have had to load first.
- **Removing the studio's window tab.** Rejected: rendering a window mockup on
  a device screen in the 3D scene is a distinct, useful output, not a duplicate.
