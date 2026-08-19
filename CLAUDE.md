# CLAUDE.md

Guidance for AI agents working in this repository.

## What this is

**Mockup Studio** — a free, open-source, fully-local 3D mockup generator. Users upload a
screenshot or screen recording and render it on procedurally-generated device models inside
a customizable 3D studio, then export stills or video.

## Read these first

- [`docs/planning/PLAN.md`](docs/planning/PLAN.md) — the approved architecture and phased roadmap (P0-P11).
- [`docs/planning/REQUIREMENTS.md`](docs/planning/REQUIREMENTS.md) — every tracked requirement with a status.
  **Update the status column as you complete work.** Nothing may be dropped from this list;
  if something proves infeasible, mark it `BLOCKED` with a written reason.
- [`docs/reference/architecture.md`](docs/reference/architecture.md) — layering and cross-cutting decisions.
- [`docs/adr/`](docs/adr/) — why things are the way they are. Read the relevant ADR before
  reversing a decision.

## Non-negotiable constraints

These are enforced by tooling. Do not weaken the rules to make code pass.

1. **No hardcoded CSS colours** outside `src/styles/tokens/`. Use semantic tokens.
2. **150 lines per file, 80 per function.** Hitting the limit means extract, not raise.
3. **Strict TypeScript.** No `any`, no non-null assertions used to silence the compiler.
4. **Fully local.** No network requests at runtime — no CDN fonts, no CDN HDRIs, no
   analytics, no API calls. This is a core product promise.

Verify with `npm run verify` (typecheck + eslint + stylelint + tests).

## Architectural invariants

- **Controls are data, not JSX.** Add a knob by adding one entry to a panel schema in
  `src/app/panels/`, using typed `select`/`update` accessor pairs — never string paths.
- **Zod schemas are the source of truth** for all config. Types come from `z.infer`. Never
  hand-write a config interface alongside a schema.
- **Cross-feature imports go through `index.ts` barrels.** ESLint blocks deep imports.
- **`lib/` stays pure** — no React, no DOM globals a function was not handed.
- **Device details are data.** New device = a spec file in `features/devices/catalog/`.
- **Screen overlays are texture layers, never geometry**, so they work identically for
  procedural and GLB devices.

## Working style for this repo

- The app must typecheck, lint and build cleanly at the end of every phase. Do not leave the
  tree broken between phases.
- Document as you go, in the same commit as the code. If you make a decision that a future
  reader would question, write an ADR.
- Commit locally as you go, with conventional-commit prefixes.
- When you add a guard or a constraint, **verify it actually fires** rather than assuming it
  does.

## Stack

React 19.2 · Vite 8 (Rolldown) · TypeScript 6 · three.js 0.185 · React Three Fiber 9 ·
drei 10 · postprocessing · Zustand 5 + Immer · Zod 4 · CSS Modules · Vitest.

The React Compiler was deliberately removed — see
[`docs/adr/0002-drop-react-compiler.md`](docs/adr/0002-drop-react-compiler.md). Do not
re-add it without reading that first.
