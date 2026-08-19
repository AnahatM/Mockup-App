# ADR 0005 — Undo/redo by scene snapshot, recorded by observation

**Status:** accepted
**Date:** 2026-08-19

## Context

The studio has several hundred controls. Users expected undo, and a commercial
comparison (shots.so) offers it, so its absence was conspicuous.

Two decisions had to be made: *what* to store in the history, and *when* to
record an entry.

## Decision

### Store whole snapshots of the scene, not inverse commands

Each history entry is a complete `SceneState` — exactly the object a saved
preset contains.

The command-pattern alternative would have every control declare how to undo
itself. That is more memory-efficient, but in this codebase controls are
declared as *data* with generic `update: (draft, value) => …` accessors
(see [ADR 0004](0004-zod-config-source-of-truth.md) and
`src/ui/controls/types.ts`). There is no natural place for an inverse to live,
and requiring every future control to supply one is a rule that will eventually
be forgotten — producing an undo that silently skips a setting.

The memory argument does not apply here anyway. The scene is a few kilobytes of
plain data, immer gives structural sharing so unchanged sections are the same
objects across snapshots, and the stack is capped at 50.

### Snapshot the scene only, never the whole store

The store also holds UI state (which panel is open, panel widths) and the loaded
media. Nobody means to undo a panel resize, and undoing an upload would be
alarming. Snapshotting exactly what a preset saves also means the two definitions
of "the scene" cannot drift apart — `captureScene`/`applyScene` serve both.

### Record by observing the store, with a quiet period

A recorder subscribes to the store and takes a snapshot once the scene has been
unchanged for 450ms.

This follows from the same reasoning as the first decision: because controls are
generic data, there is no single action funnel to instrument, and a convention
that each action calls `recordHistory` would decay. Observation cannot be
forgotten by a future control.

The quiet period is what makes undo usable rather than merely present. Dragging
a slider emits an update per pointer move, so recording every change would fill
the whole stack with one gesture and make undo step back a pixel at a time.
Coalescing means one drag is one undo step, which is what a user means by "undo
that".

Changes are compared by section reference before recording, which is exact and
O(1) given immer's structural sharing.

## Consequences

- A new control gets undo automatically, with no work and nothing to remember.
- Undo granularity is a gesture, not an event.
- An `applyingHistory` flag is required so the recorder does not treat its own
  undo as a fresh edit — without it, undo could not escape the state it
  restored. This is the one piece of coupling the observation approach costs.
- Recording is delayed by 450ms, so an undo pressed immediately after a change
  steps back to before that change rather than to a mid-gesture value. This is
  the desired behaviour, but it does mean history is eventually-consistent with
  the scene.
- "Start over" resets the scene through the same mechanism, so it is undoable
  like anything else, and deliberately keeps the loaded media.

## Alternatives considered

- **zustand `temporal` / zundo middleware.** Rejected: it snapshots the whole
  store by default, and configuring it to partialise down to the scene plus
  handle coalescing amounted to the same work as the 60-line implementation,
  with a dependency and less control over the equality check.
- **Recording inside `set`.** Would have caught every change with no observer,
  but there is no single `set` — each slice calls it directly.
