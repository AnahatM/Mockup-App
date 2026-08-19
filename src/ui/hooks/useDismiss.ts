import { useEffect, type RefObject } from 'react'

/**
 * Closes a transient surface (popover, menu) on Escape or on a pointer press
 * outside it.
 *
 * Listens on `pointerdown` rather than `click` so the surface closes on press
 * instead of release — otherwise a press that starts outside and releases inside
 * would be swallowed, which feels broken while dragging a colour picker.
 */
export function useDismiss(
  ref: RefObject<HTMLElement | null>,
  open: boolean,
  onDismiss: () => void,
): void {
  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target
      if (target instanceof Node && !ref.current?.contains(target)) onDismiss()
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onDismiss()
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [ref, open, onDismiss])
}
