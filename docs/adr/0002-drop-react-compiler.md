# ADR 0002 — Remove the React Compiler from the scaffold

**Status:** Accepted
**Date:** 2026-08-19

## Context

The Vite scaffold shipped with the React Compiler enabled via `babel-plugin-react-compiler`,
wired in through `@rolldown/plugin-babel`.

## Decision

Remove it, along with `@babel/core`, `@rolldown/plugin-babel` and `@types/babel__core`.

## Rationale

- **It conflicts with how React Three Fiber works.** R3F is deliberately mutation-heavy: the
  render loop mutates three.js objects through refs every frame and intentionally bypasses
  React's reconciler for per-frame updates. The compiler's aggressive automatic memoization
  assumes value-semantics purity that this code does not have, which produces a class of
  bugs that are hard to attribute — stale object references and skipped updates that look
  like three.js problems rather than compiler problems.
- **It forces Babel into an otherwise Babel-free build.** Vite 8 is Rolldown-native; the
  compiler reintroduces a full Babel pass over every file, which the scaffold's own README
  notes will slow dev and build.
- **The benefit is small here.** The compiler optimises React re-renders. In this app the
  performance-critical path is the WebGL render loop, which the compiler does not touch.

## Consequences

- Memoization is manual where it matters. In practice this is rare, because the expensive
  work lives in `useFrame` rather than in component bodies.
- Four dev dependencies removed and a faster build.
- Reversible: re-adding the plugin is a `vite.config.ts` change, and any component that
  needed opting out could use a `'use no memo'` directive.
