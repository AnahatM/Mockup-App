import { useEffect, useRef } from 'react'
import { IconButton } from '@/ui'
import { closeShortcutsHelp, useShortcutsHelpOpen } from './help'
import { SHORTCUTS } from './registry'
import styles from './ShortcutsOverlay.module.css'

/**
 * The keyboard shortcut reference, opened with `?` (see `registry.ts`).
 *
 * Renders `SHORTCUTS` directly rather than a second, hand-maintained list —
 * every row here is a shortcut `useShortcuts` actually dispatches, so the two
 * cannot drift apart. Built on `<dialog>` for the same reason as `ui/Dialog`:
 * focus trapping, Escape and the top layer come from the platform.
 */
export function ShortcutsOverlay() {
  const open = useShortcutsHelpOpen()
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (open && !node.open) node.showModal()
    if (!open && node.open) node.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby="shortcuts-heading"
      onCancel={(event) => {
        event.preventDefault()
        closeShortcutsHelp()
      }}
      onClick={(event) => event.target === ref.current && closeShortcutsHelp()}
    >
      <div className={styles.body}>
        <div className={styles.header}>
          <h2 id="shortcuts-heading" className={styles.title}>
            Keyboard shortcuts
          </h2>
          <IconButton
            icon="close"
            label="Close"
            size="sm"
            onClick={closeShortcutsHelp}
          />
        </div>
        <ul className={styles.list}>
          {SHORTCUTS.map((shortcut) => (
            <li key={shortcut.id} className={styles.row}>
              <span className={styles.description}>{shortcut.description}</span>
              <kbd className={styles.kbd}>{shortcut.display}</kbd>
            </li>
          ))}
        </ul>
      </div>
    </dialog>
  )
}
