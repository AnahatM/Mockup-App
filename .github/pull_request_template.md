## What this changes

<!-- One or two sentences. If it changes what something looks like, a
     before/after screenshot says it far better than a paragraph. -->

## Checks

- [ ] `npm run verify` passes (typecheck, eslint, stylelint, tests)
- [ ] `npm run build` passes
- [ ] Docs updated in this same commit, if this changes behaviour
- [ ] An ADR added under `docs/adr/`, if this reverses or replaces a decision

If this touches the 3D scene, the device catalogue or the deployed headers,
please also say which of the `scripts/verify-*.mjs` harnesses you ran. Those
cover the things no unit test can see, and the list is in CONTRIBUTING.md.

## Constraints this repo enforces

These are checked by tooling and will fail the build, so it is worth a glance
before pushing:

- No hardcoded CSS colours outside `src/styles/tokens/`
- 150 lines per file, 80 per function — extract rather than raise the limit
- Strict TypeScript: no `any`, no non-null assertions used to silence it
- **No network requests at runtime.** No CDN fonts, no analytics, no API calls.
  This is the product, not a preference — `scripts/verify-offline.mjs` checks it.
