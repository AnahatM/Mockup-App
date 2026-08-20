import { useEffect, useRef } from 'react'
import { IconButton } from '@/ui'
import { closeShortcutsHelp, useShortcutsHelpOpen } from './help'
import { GESTURES } from './gestures'
import { SHORTCUTS } from './registry'
import type { RegistryEntry, ShortcutGroup } from './types'
import styles from './ShortcutsOverlay.module.css'

const GROUPS: readonly ShortcutGroup[] = ['Studio', 'Editing', 'Viewport']
const ENTRIES: readonly RegistryEntry[] = [...SHORTCUTS, ...GESTURES]

/**
 * The keyboard shortcut and navigation reference, opened with `?` (see
 * `registry.ts`).
 *
 * Renders `SHORTCUTS` and `GESTURES` directly rather than a second,
 * hand-maintained list — every keyboard row here is a shortcut
 * `useShortcuts` actually dispatches, and every gesture row is documentation
 * for the real behaviour in `features/camera`, so the reference cannot drift
 * from what the app does. Built on `<dialog>` for the same reason as
 * `ui/Dialog`: focus trapping, Escape and the top layer come from the platform.
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
        {GROUPS.map((group) => (
          <ShortcutGroupSection key={group} group={group} />
        ))}
      </div>
    </dialog>
  )
}

function ShortcutGroupSection({ group }: { group: ShortcutGroup }) {
  const entries = ENTRIES.filter((entry) => entry.group === group)
  if (entries.length === 0) return null

  return (
    <section aria-labelledby={`shortcuts-${group}`}>
      <h3 id={`shortcuts-${group}`} className={styles.sectionTitle}>
        {group}
      </h3>
      <ul className={styles.list}>
        {entries.map((entry) => (
          <li key={entry.id} className={styles.row}>
            <span className={styles.description}>{entry.description}</span>
            <kbd className={styles.kbd}>{entry.display}</kbd>
          </li>
        ))}
      </ul>
    </section>
  )
}
