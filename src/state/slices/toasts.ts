import { createId } from '@/lib/id'
import type { SliceCreator } from '../types'

export type ToastTone = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  message: string
  tone: ToastTone
}

export interface ToastSlice {
  /**
   * Transient confirmations.
   *
   * Several actions in this app succeed silently — an export writes a file to
   * the downloads folder, a preset applies to a scene the user may not be
   * looking at — and silence is indistinguishable from failure.
   */
  toasts: Toast[]
  notify: (message: string, tone?: ToastTone) => void
  dismissToast: (id: string) => void
}

/** Beyond this, the stack covers the thing the user is trying to see. */
const MAX_VISIBLE = 3

export const createToastSlice: SliceCreator<ToastSlice> = (set) => ({
  toasts: [],

  notify: (message, tone = 'success') =>
    set((draft) => {
      draft.toasts.push({ id: createId('toast'), message, tone })
      if (draft.toasts.length > MAX_VISIBLE) draft.toasts.shift()
    }),

  dismissToast: (id) =>
    set((draft) => {
      draft.toasts = draft.toasts.filter((toast) => toast.id !== id)
    }),
})
