import { useCallback, useState, type ReactNode } from 'react'
import { Dialog } from '../Dialog'

interface Pending {
  title: string
  description?: ReactNode
  confirmLabel?: string
  destructive?: boolean
  resolve: (confirmed: boolean) => void
}

export interface ConfirmOptions {
  title: string
  description?: ReactNode
  confirmLabel?: string
  destructive?: boolean
}

/**
 * Promise-based confirmation.
 *
 * `const ok = await confirm({ ... })` reads like `window.confirm` at the call
 * site, which is the point — replacing the native dialog should not mean
 * restructuring every caller into callbacks.
 */
export function useConfirm(): {
  confirm: (options: ConfirmOptions) => Promise<boolean>
  dialog: ReactNode
} {
  const [pending, setPending] = useState<Pending | null>(null)

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => setPending({ ...options, resolve })),
    [],
  )

  const settle = (confirmed: boolean) => {
    pending?.resolve(confirmed)
    setPending(null)
  }

  const dialog = (
    <Dialog
      open={pending !== null}
      title={pending?.title ?? ''}
      description={pending?.description}
      confirmLabel={pending?.confirmLabel ?? 'Confirm'}
      destructive={pending?.destructive ?? false}
      onConfirm={() => settle(true)}
      onCancel={() => settle(false)}
    />
  )

  return { confirm, dialog }
}
