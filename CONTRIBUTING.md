# Contributing

Thanks for helping. This project is deliberately structured so that the most useful
contributions are also the easiest ones.

## Setup

```bash
npm install
npm run dev
```

Before opening a PR:

```bash
npm run verify   # typecheck + eslint + stylelint + tests
```

## The three enforced rules

These are checked by tooling, not by review, because they are the conventions that quietly
erode in every codebase:

1. **No hardcoded colours.** Literal colours belong only in `src/styles/tokens/`. Everywhere
   else uses `var(--semantic-token)`. See [`docs/reference/design-tokens.md`](docs/reference/design-tokens.md).
2. **No long files.** 150 lines per file, 80 per function. If you hit the limit, extract a
   component, a hook, or a pure helper into `lib/`. Please do not raise the limit — the limit
   is doing its job.
3. **Strict TypeScript.** No `any`, no non-null assertions to silence the compiler. If the
   types are fighting you, the model is usually wrong somewhere upstream.

## Where code goes

| Layer           | Contains                     | Rule                                             |
| --------------- | ---------------------------- | ------------------------------------------------ |
| `src/lib/`      | Pure functions, no React     | Must be unit-testable with no mocks              |
| `src/ui/`       | Design-system primitives     | No domain knowledge; reusable in any app         |
| `src/state/`    | Zustand slices               | One file per domain                              |
| `src/features/` | Domain slices                | Cross-feature imports go through `index.ts` only |
| `src/app/`      | Layout and panel composition | Thin — composition, not logic                    |

Reaching into another feature's internals (`@/features/scene/Backdrop`) is blocked by
ESLint. Import the barrel (`@/features/scene`) instead.

## Adding a device

This is the highest-value contribution and usually a single data file.

1. Create `src/features/devices/catalog/<your-device>.ts` exporting a `DeviceSpec`.
2. Register it in `src/features/devices/spec/registry.ts`.

Full walkthrough, including the dimension and material fields:
[`docs/reference/device-specs.md`](docs/reference/device-specs.md).

Devices are original procedural approximations. Please do not contribute models copied from
a manufacturer's assets, and keep brand references to describing the form factor.

## Adding a control

Controls are data, not JSX. Add one line to the relevant panel schema in
`src/app/panels/` — labelling, keyboard handling, focus behaviour and store binding all come
for free. If you find yourself writing a bespoke input, check whether a `ui/` primitive
already covers it.

## Verifying in a real browser

Unit tests cover the pure layers, but most of this app is a render — and a render
can compile perfectly and still be wrong. `scripts/` holds headless checks that
drive the real UI against a running dev server (`npm run dev` first):

| Script                | Checks                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------- |
| `verify-catalog.mjs`  | Every device renders, with no console errors and no suspiciously blank frame                |
| `verify-media.mjs`    | A screenshot uploads and lands on the device screen                                         |
| `verify-video.mjs`    | A generated WebM decodes and plays, confirmed by sampling pixels over time                  |
| `verify-export.mjs`   | Exported PNG has the exact requested dimensions; `--transparent` checks real alpha          |
| `verify-record.mjs`   | The scene animates and the Record button produces a valid WebM                              |
| `verify-presets.mjs`  | A preset survives a page reload, exports, and a corrupted file is rejected without crashing |
| `verify-window.mjs`   | Window chrome renders on a device and exports flat                                          |
| `verify-exposure.mjs` | Tone-mapping exposure actually reaches the renderer                                         |
| `verify-structure-extremes.mjs` | No backdrop environment swallows the scene at any slider setting                  |
| `verify-responsive.mjs` | Every route, both themes, five widths: no overflow, no console errors                     |
| `verify-offline.mjs`  | **No request ever leaves the machine.** The whole product promise, measured               |
| `verify-csp.mjs`      | The deployed Content-Security-Policy does not block the app, and its script hash is current |
| `probe-capture.mjs`   | Isolates canvas capture behaviour when recording misbehaves                                 |

These measure rather than eyeball, which is deliberate: exposure once appeared to
work and was doing nothing at all, and recording once produced zero bytes while
reporting success. Both were found by measuring, not looking.

Two of them need the build served the way the deployment serves it, headers and
all, because `vite preview` sends none of `vercel.json`'s headers and the CSP is
therefore invisible to every other check here:

```sh
npm run build
npm run serve:deployed &          # reads vercel.json, so the two cannot drift
npm run verify:csp
PORT=4180 npm run verify:offline
```

That is not hypothetical tidiness. The first run of `verify:csp` found the
pre-paint theme script blocked on every route — a flash of the wrong palette on
the live site, and nothing local would ever have said so.

Neither is a substitute for deploying, though. `npm run deploy:preview` puts the
app on a real Vercel URL without an account, which is the only way to find the
class of problem that lives in the platform rather than in the app — the CSP
rationale was in a `"//"` key that Vercel rejects outright, failing the deploy
before it built anything, and the local server had been written to tolerate it.

### Looking, when looking is the point

Some failures are not a number. Geometry grazing a device, a backdrop edge in
frame, a laptop deck that renders perfectly and still does not look like a
keyboard — those need eyes. `npm run sheets -- <sweep>` composites a whole sweep
into one labelled PNG under `scripts/out/`, so looking is cheap:

```sh
npm run sheets -- environments   # every backdrop, and its slider extremes
npm run sheets -- cameras        # all nine angle presets over a moving field
npm run sheets -- devices        # a watch through a monitor, an order of magnitude apart
npm run sheets -- details        # close enough to judge a keyboard or a strap
```

## Commits

Conventional-commit prefixes (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`). Keep code and
its documentation in the same commit.

## Reporting bugs

Include your browser and GPU, and — if it is a rendering issue — the exported preset JSON.
A preset file reproduces a scene exactly, which usually turns a vague report into a one-minute
diagnosis.
