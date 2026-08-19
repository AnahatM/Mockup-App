import { IconButton } from '@/ui'
import { useAppStore } from '@/state/store'
import styles from './Toolbar.module.css'

/**
 * Transport for the animation clip.
 *
 * On the toolbar rather than buried in the Animate panel, because you almost
 * always want to scrub a motion preset while looking at something else.
 */
export function PlaybackControls() {
  const playing = useAppStore((state) => state.animation.playing)
  const setPlaying = useAppStore((state) => state.setAnimationPlaying)
  const restart = useAppStore((state) => state.restartAnimation)

  return (
    <div className={styles.cluster} role="group" aria-label="Playback">
      <IconButton
        icon={playing ? 'pause' : 'play'}
        label={playing ? 'Pause animation' : 'Play animation'}
        size="sm"
        active={playing}
        onClick={() => setPlaying(!playing)}
      />
      <IconButton icon="undo" label="Restart animation" size="sm" onClick={restart} />
    </div>
  )
}
