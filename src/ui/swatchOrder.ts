import type { SwatchOption } from './SwatchGrid'

/**
 * Puts the selected swatch first.
 *
 * The grid collapses to a handful of entries, so the selected colour has to be
 * among them — a collapsed palette that hides the colour currently applied is
 * worse than no collapsing at all. Everything else keeps its declared order.
 */
export function orderBySelection(
  options: readonly SwatchOption[],
  selectedId: string | undefined,
): readonly SwatchOption[] {
  if (selectedId === undefined) return options
  const selected = options.find((option) => option.id === selectedId)
  if (!selected) return options
  return [selected, ...options.filter((option) => option.id !== selectedId)]
}
