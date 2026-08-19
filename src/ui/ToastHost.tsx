import { useAppStore } from '@/state/store'
import { Toast } from './Toast'
import styles from './Toast.module.css'

/** Renders the toast stack. Mount once, near the root. */
export function ToastHost() {
  const toasts = useAppStore((state) => state.toasts)
  const dismiss = useAppStore((state) => state.dismissToast)

  if (toasts.length === 0) return null

  return (
    <div className={styles.host}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          tone={toast.tone}
          onDismiss={() => dismiss(toast.id)}
        />
      ))}
    </div>
  )
}
