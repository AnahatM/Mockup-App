/** A text measurer: the width, in px, that `text` would render at. Injected
 * so the wrapping algorithm stays pure and unit-testable without a canvas —
 * `textBlock.ts` supplies the real one, backed by `CanvasRenderingContext2D`. */
export type Measure = (text: string) => number

/**
 * Greedy word-wrap. Explicit newlines in the source start a new paragraph;
 * within a paragraph, words are packed onto a line until the next one would
 * exceed `maxWidth`. A single word wider than `maxWidth` gets its own line
 * rather than being split — headlines are short, and mid-word breaks read as
 * a bug, not a feature.
 */
export function wrapText(measure: Measure, text: string, maxWidth: number): string[] {
  const trimmed = text.trim()
  if (trimmed.length === 0) return []

  const lines: string[] = []
  for (const paragraph of trimmed.split(/\n+/)) {
    lines.push(...wrapParagraph(measure, paragraph, maxWidth))
  }
  return lines
}

function wrapParagraph(measure: Measure, paragraph: string, maxWidth: number): string[] {
  const words = paragraph.split(/\s+/).filter(Boolean)
  if (words.length === 0) return []

  const lines: string[] = []
  let current = words[0] ?? ''

  for (const word of words.slice(1)) {
    const candidate = `${current} ${word}`
    if (measure(candidate) <= maxWidth) {
      current = candidate
    } else {
      lines.push(current)
      current = word
    }
  }
  lines.push(current)
  return lines
}
