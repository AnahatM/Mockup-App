# ADR 0004 — Zod schemas as the single source of truth for configuration

**Status:** Accepted
**Date:** 2026-08-19

## Context

Scene configuration needs to exist in four forms at once: TypeScript types for development,
the Zustand store shape at runtime, a serialised manifest for save/share, and untrusted JSON
on import. Defining these separately guarantees they drift apart.

Imported presets are genuinely untrusted input — a file from someone else on the internet,
or a hand-edited one — and must never be able to crash the app.

## Decision

Define each config domain once as a Zod schema, and derive everything else from it.

```ts
export const lightingSchema = z.object({/* ... */})
export type LightingConfig = z.infer<typeof lightingSchema>
```

## Rationale

- **One definition, four guarantees.** The type, the store, the file format and the
  validator can no longer disagree, because they are the same object.
- **Safe import.** `schema.safeParse(json)` turns a hostile or malformed file into a typed
  error we can show the user, rather than an exception deep inside a render.
- **Real versioning.** Because the format is a value, migrations between manifest versions
  are ordinary functions that can be unit-tested against fixtures of every prior version.
- **Defaults live with the schema**, so "reset this section" and "fill in a field an old
  preset lacks" are the same mechanism.

## Consequences

- Config types must be written in Zod rather than as plain interfaces. This is slightly more
  verbose at the definition site and pays for itself at every boundary.
- Validation runs on load and import, not on every store write, so there is no hot-path cost.
- `features/presets/migrate.ts` must gain a step for every breaking schema change. This is a
  deliberate, visible cost that keeps saved presets working.
