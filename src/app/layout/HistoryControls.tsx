import { IconButton, useConfirm } from '@/ui'
import { canRedo, canUndo } from '@/lib/history'
import { useAppStore } from '@/state/store'
import styles from './Toolbar.module.css'

/** Undo and redo for the scene. */
export function HistoryControls() {
  const history = useAppStore((state) => state.history)
  const undoScene = useAppStore((state) => state.undoScene)
  const redoScene = useAppStore((state) => state.redoScene)
  const startOver = useAppStore((state) => state.startOver)
  const { confirm, dialog } = useConfirm()

  const askThenReset = async () => {
    const ok = await confirm({
      title: 'Start over?',
      description:
        'Every scene setting goes back to its default. Your screenshot stays loaded, and this can be undone.',
      confirmLabel: 'Start over',
      destructive: true,
    })
    if (ok) startOver()
  }

  return (
    <div className={styles.cluster} role="group" aria-label="History">
      <IconButton
        icon="undo"
        label="Undo"
        size="sm"
        disabled={!canUndo(history)}
        onClick={undoScene}
      />
      <IconButton
        icon="redo"
        label="Redo"
        size="sm"
        disabled={!canRedo(history)}
        onClick={redoScene}
      />
      <IconButton
        icon="reset"
        label="Start over"
        size="sm"
        onClick={() => void askThenReset()}
      />
      {dialog}
    </div>
  )
}
