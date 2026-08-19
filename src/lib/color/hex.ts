/** Hex colour parsing and conversion. Pure — no DOM, no three.js. */

export interface Rgb {
  r: number
  g: number
  b: number
}

const SHORT_HEX = /^#?([\da-f])([\da-f])([\da-f])$/i
const LONG_HEX = /^#?([\da-f]{6})$/i

/**
 * Accepts `abc`, `#abc`, `aabbcc` or `#AABBCC` and returns a canonical
 * `#aabbcc`. Returns null for anything unparseable, so callers can reject bad
 * input from a text field or an imported preset instead of rendering garbage.
 */
export function normalizeHex(input: string): string | null {
  const value = input.trim()

  const short = SHORT_HEX.exec(value)
  if (short) {
    const [, r, g, b] = short
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
  }

  const long = LONG_HEX.exec(value)
  return long ? `#${long[1]}`.toLowerCase() : null
}

export function isHex(input: string): boolean {
  return normalizeHex(input) !== null
}

/** Assumes a canonical hex. Use `normalizeHex` first for untrusted input. */
export function hexToRgb(hex: string): Rgb {
  const normalized = normalizeHex(hex) ?? '#000000'
  const int = Number.parseInt(normalized.slice(1), 16)
  return {
    r: (int >> 16) & 0xff,
    g: (int >> 8) & 0xff,
    b: int & 0xff,
  }
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const channel = (value: number) =>
    Math.round(Math.min(Math.max(value, 0), 255))
      .toString(16)
      .padStart(2, '0')
  return `#${channel(r)}${channel(g)}${channel(b)}`
}
