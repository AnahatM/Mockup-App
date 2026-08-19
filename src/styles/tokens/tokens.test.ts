import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * Guards the token contract described in docs/reference/design-tokens.md.
 *
 * A semantic token defined in only one theme is a real bug and a nasty one: the
 * component silently falls back to an unset variable, so an element goes invisible
 * or unstyled in exactly one theme — easy to miss in review, and easy to miss in
 * manual testing if you only ever look at one theme.
 */

const read = (file: string): string =>
  readFileSync(fileURLToPath(new URL(file, import.meta.url)), 'utf8')

const semanticCss = read('./semantic.css')
const primitivesCss = read('./primitives.css')

const DARK_SELECTOR = "[data-theme='dark']"
const DECLARATION = /^[ \t]*(--[a-z0-9-]+)[ \t]*:/gm
const REFERENCE = /var\((--[a-z0-9-]+)\)/g

/** Collects the first capture group of every match. */
function captures(source: string, pattern: RegExp): string[] {
  const found: string[] = []
  for (const match of source.matchAll(pattern)) {
    const group = match[1]
    if (group !== undefined) found.push(group)
  }
  return found
}

const darkStart = semanticCss.indexOf(DARK_SELECTOR)
const lightTokens = new Set(captures(semanticCss.slice(0, darkStart), DECLARATION))
const darkTokens = new Set(captures(semanticCss.slice(darkStart), DECLARATION))

describe('semantic token parity', () => {
  it('locates both theme blocks', () => {
    expect(darkStart).toBeGreaterThan(0)
    expect(lightTokens.size).toBeGreaterThan(20)
  })

  it('defines every light-theme token in the dark theme', () => {
    const missing = [...lightTokens].filter((token) => !darkTokens.has(token))
    expect(missing, `missing from ${DARK_SELECTOR}`).toEqual([])
  })

  it('defines every dark-theme token in the light theme', () => {
    const missing = [...darkTokens].filter((token) => !lightTokens.has(token))
    expect(missing, 'missing from the default/light block').toEqual([])
  })
})

describe('token tiering', () => {
  it('resolves every primitive referenced by the semantic layer', () => {
    const primitives = new Set(captures(primitivesCss, DECLARATION))
    const referenced = new Set(captures(semanticCss, REFERENCE))
    const unresolved = [...referenced].filter((token) => !primitives.has(token))
    expect(unresolved, 'referenced in semantic.css but never defined').toEqual([])
  })

  it('keeps the chalk palette free of pure black and pure white', () => {
    const banned = primitivesCss.match(/#(?:fff(?:fff)?|000(?:000)?)\b/gi)
    expect(
      banned,
      'chalk uses no pure black or white — see docs/reference/design-tokens.md',
    ).toBe(null)
  })
})
