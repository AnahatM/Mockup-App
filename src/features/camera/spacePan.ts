/**
 * Whether the most recent hold of a pan-trigger key (Space or Shift, see
 * `useSpacePan`) included an actual drag.
 *
 * Read by the `play` shortcut in `shortcuts/registry.ts`: Space doubles as
 * both "hold + drag to pan" and "tap to play/pause", and this is how the two
 * are told apart without picking just one — see `useSpacePan` for the full
 * reasoning. A plain module-level flag, not store state, because it needs to
 * be readable synchronously at the moment a keyup fires, with no React round
 * trip — the same reasoning as the capture gizmo guards.
 */
let draggedWhileHeld = false

export function setSpacePanDrag(value: boolean): void {
  draggedWhileHeld = value
}

export function wasSpacePanDrag(): boolean {
  return draggedWhileHeld
}
