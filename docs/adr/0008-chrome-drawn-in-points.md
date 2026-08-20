# ADR 0008 — Device and window chrome is drawn in platform points

**Status:** accepted
**Date:** 2026-08-20

## Context

The app draws several pieces of somebody else's user interface: a macOS title
bar, browser chrome, an iOS status bar, a home indicator, an Android navigation
bar, a macOS menu bar and Dock. None of it is the user's screenshot — it is the
frame the screenshot sits inside, and it is what makes an export read as a
product shot rather than as a rectangle with a picture in it.

All of it was authored as fractions of whatever box it was drawn into. The
window buttons were `barHeight * 0.16`, the Dock was `hsl(i * 47, 62%, 58%)`, the
Apple menu was a filled circle, and the browser's tab strip was grey pills with
a darker bar standing in for a label. Three problems followed:

1. **A fraction is not a measurement.** `barHeight * 0.16` reads as a deliberate
   number but encodes nothing. The real figure is 12pt on a 28pt title bar,
   which is `barHeight * 0.214` — the buttons had been a third too small since
   they were written, and nobody could tell by reading the code.
2. **The same fraction means different things on different boxes.** Safari's
   toolbar is 52pt tall and carries the *same* 12pt buttons as a 28pt title bar.
   A single "fraction of the bar" cannot express that, and when the browser
   chrome was rewritten it inherited the title bar's fraction and produced
   buttons nearly twice full size.
3. **Nothing could be checked.** Every number was a float times a float. Getting
   one wrong produced a mockup that looked slightly off, which no test and no
   type could catch, and which is exactly the failure mode a mockup tool cannot
   afford — the whole product is "does this look like the real thing".

## Decision

**Chrome is authored in the platform's own points, and each surface converts
once.** A title bar computes `pt = height / 28`; a Safari toolbar computes
`pt = height / 52`; the iOS status bar works in fractions of a 393pt-wide
screen. Every measurement after that is a literal reading off the real
interface — `LIGHT_DIAMETER_PT = 12`, `FIELD_HEIGHT_PT = 28`, `TITLE_PT = 13` —
and the constants carry the reference height that makes them meaningful.

Three rules follow from it:

- **Colour still comes from the config, never from points.** The chrome is
  user-colourable and can be matched to an arbitrary screenshot, so what is
  fixed is the *relationship* between colours (the bar is a shade lighter at the
  top, the separator is stronger on dark chrome than light), not the values.
  The exceptions are the traffic lights, the Dock icons and the overlay glyphs,
  which are a rendering of another OS's UI rather than this app's styling and
  must not move with the theme.
- **The chrome never invents content.** A mockup carries one title and one URL.
  The frontmost browser tab gets the real title; the others get a favicon and a
  muted label bar, because a tab you are not reading is illegible at this size
  anyway. Generating plausible page titles would put words into someone's
  screenshot that they never wrote, and they would ship them without noticing.
- **The measurements are tested against restated literals.** `chrome.test.ts`
  asserts 12pt buttons at a 20pt pitch by writing `12` and `20`, not by
  importing `LIGHT_DIAMETER_PT`. Importing them would make every assertion a
  tautology that moves with the bug — verified by changing the constant and
  watching the suite stay green.

## Consequences

Drawing code is checkable by reading it: anyone with a screenshot of the real
interface can confirm a number, and a wrong one is a visible discrepancy rather
than an unfalsifiable float.

The conversion is per-surface, so a bar that is not at its reference proportion
still looks internally right. The app's default `barHeight` is deliberately
about twice a real title bar's share of a window — chrome that is physically
accurate is too small to read at mockup scale — and points-per-surface absorbs
that without any surface looking wrong relative to itself.

Testing needed a recording `CanvasRenderingContext2D` (`recordingContext.ts`),
because jsdom's canvas throws without the native `canvas` package and adding a
native build dependency to check that a circle landed at x = 20pt is a poor
trade. It implements only the surface the chrome touches; anything new fails
loudly rather than silently recording nothing.

The cost is that the chrome modules now know a table of platform constants that
will drift as those platforms change. That is the correct place for the
knowledge to live, and it is at least now written down where a future reader can
compare it against a screenshot.
