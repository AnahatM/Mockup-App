import { useEffect, useRef, type ReactNode } from 'react'
import { cx } from '@/lib/cx'
import { Button } from './Button'
import styles from './Dialog.module.css'

export interface DialogProps {
  open: boolean
  title: string
  description?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  /** Renders the confirm button as destructive. */
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/**
 * A confirmation dialog, replacing `window.confirm`.
 *
 * The native one is worth replacing for reasons beyond looks: it cannot be
 * styled or themed, it blocks the entire JS thread (which stalls the render
 * loop mid-frame), some browsers let a user suppress it permanently — at which
 * point every future confirm silently returns false — and its wording is fixed
 * to OK/Cancel rather than naming the action.
 *
 * Built on `<dialog>` so focus trapping, Escape and the top layer come from the
 * platform rather than being reimplemented.
 */
export function Dialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}: DialogProps) {
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
      aria-labelledby={`${title}-heading`}
      // Escape and the backdrop both cancel, which is what people expect and
      // what keeps a modal from being a trap.
      onCancel={(event) => {
        event.preventDefault()
        onCancel()
      }}
      onClick={(event) => {
        if (event.target === ref.current) onCancel()
      }}
    >
      <div className={styles.body}>
        <h2 id={`${title}-heading`} className={styles.title}>
          {title}
        </h2>
        {description && <div className={styles.description}>{description}</div>}
        <div className={styles.actions}>
          <Button size="md" variant="subtle" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            size="md"
            variant={destructive ? 'danger' : 'primary'}
            className={cx(destructive && styles.destructive)}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  )
}
