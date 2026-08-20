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

## Alternatives considered

- **A modal inside the studio.** The first plan, and the user's initial
  suggestion. Rejected once the reasoning above was written down: a modal would
  have fixed the preview problem but none of the cost, availability or
  discoverability ones, because the studio would still have had to load first.
- **Removing the studio's window tab.** Rejected: rendering a window mockup on
  a device screen in the 3D scene is a distinct, useful output, not a duplicate.
