import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { contrastRatio } from '@/lib/color/contrast'

/**
 * Holds the palette to WCAG contrast, automatically.
 *
 * This palette has been rebuilt twice — once to a cool scheme, once to Horizon
 * — and each time the ratios were measured by hand. That caught two failures
 * only because someone remembered to look: a primary button at 4.32:1 and, in
 * an earlier draft, muted text at 1.95:1. Neither would have been visible in a
 * screenshot, and neither would have failed any other test.
 *
 * Thresholds follow WCAG: 4.5:1 for anything carrying text (1.4.3), 3:1 for
 * non-text indicators that convey information such as focus rings and borders
 * (1.4.11). Purely decorative colour has no requirement and is not listed.
 */

const read = (file: string): string =>
  readFileSync(fileURLToPath(new URL(file, import.meta.url)), 'utf8')

const primitivesCss = read('./primitives.css')
const semanticCss = read('./semantic.css')

const DARK_SELECTOR = "[data-theme='dark']"
const darkStart = semanticCss.indexOf(DARK_SELECTOR)

/** `--token: value;` pairs from a block of CSS, last declaration winning. */
function declarations(source: string): Map<string, string> {
  const found = new Map<string, string>()
  for (const match of source.matchAll(/^[ \t]*(--[a-z0-9-]+)[ \t]*:[ \t]*([^;]+);/gm)) {
    const [, name, value] = match
    if (name && value) found.set(name, value.trim())
  }
  return found
}

const primitives = declarations(primitivesCss)
const themes = {
  light: declarations(semanticCss.slice(0, darkStart)),
  dark: declarations(semanticCss.slice(darkStart)),
}

/**
 * Follows `var(--a)` chains down to a literal colour.
 *
 * Returns null for anything that is not a plain colour — gradients, shadows,
 * `color-mix()` — because a contrast number for those would be meaningless
 * rather than merely approximate.
 */
function resolve(token: string, theme: Map<string, string>, depth = 0): string | null {
  if (depth > 8) return null
  const value = theme.get(token) ?? primitives.get(token)
  if (!value) return null

  const reference = /^var\((--[a-z0-9-]+)\)$/.exec(value)
  if (reference?.[1]) return resolve(reference[1], theme, depth + 1)

  return /^#[\da-f]{3,8}$/i.test(value) ? value : null
}

/** Surfaces that text and indicators are expected to sit on. */
const SURFACES = [
  '--surface-app',
  '--surface-panel',
  '--surface-raised',
  '--surface-sunken',
] as const

/** Tokens that carry text: WCAG 1.4.3, 4.5:1. */
const TEXT = ['--text-primary', '--text-secondary', '--text-muted', '--text-accent']

/**
 * Non-text tokens that convey information: WCAG 1.4.11, 3:1.
 *
 * The two gradient stops are held to the same 3:1 as any other mark, because
 * the ramp is drawn as hairlines, bars and spinner arcs. That rating covers
 * large display type too (1.4.3 relaxes to 3:1 above 24px), which is the only
 * text the ramp is allowed to paint — never body copy.
 */
const INDICATORS = [
  '--focus-ring',
  '--accent',
  '--gradient-from',
  '--gradient-to',
  '--status-success',
  '--status-warning',
  '--status-danger',
]

/** Foreground/background pairs stated explicitly by the token names. */
const PAIRS: ReadonlyArray<readonly [string, string, number]> = [
  ['--accent-contrast', '--accent', 4.5],
  ['--accent-contrast', '--accent-solid', 4.5],
  ['--accent-contrast', '--accent-solid-hover', 4.5],
  ['--text-inverse', '--text-primary', 4.5],
  ['--on-color-mark', '--on-color-shade', 3],
]

describe.each(['light', 'dark'] as const)('%s theme contrast', (name) => {
  const theme = themes[name]

  it('resolves the surfaces it is about to measure against', () => {
    for (const surface of SURFACES) {
      expect(resolve(surface, theme), `${surface} did not resolve to a colour`).toBeTruthy()
    }
  })

  for (const surface of SURFACES) {
    for (const token of TEXT) {
      it(`${token} on ${surface} clears 4.5:1`, () => {
        const fg = resolve(token, theme)
        const bg = resolve(surface, theme)
        if (!fg || !bg) return

        expect(Number(contrastRatio(fg, bg).toFixed(2))).toBeGreaterThanOrEqual(4.5)
      })
    }

    for (const token of INDICATORS) {
      it(`${token} on ${surface} clears 3:1`, () => {
        const fg = resolve(token, theme)
        const bg = resolve(surface, theme)
        if (!fg || !bg) return

        expect(Number(contrastRatio(fg, bg).toFixed(2))).toBeGreaterThanOrEqual(3)
      })
    }
  }

  for (const [foreground, background, threshold] of PAIRS) {
    it(`${foreground} on ${background} clears ${threshold}:1`, () => {
      const fg = resolve(foreground, theme)
      const bg = resolve(background, theme)
      if (!fg || !bg) return

      expect(Number(contrastRatio(fg, bg).toFixed(2))).toBeGreaterThanOrEqual(threshold)
    })
  }
})
