import { IconButton, Tooltip } from '@/ui'
import { CAMERA_MODES } from '@/features/camera'
import { useAppStore } from '@/state/store'
import styles from './Toolbar.module.css'

/** One wheel notch, so the buttons and the scroll wheel feel the same. */
const ZOOM_STEP = 1.25

const MODE_LABELS: Record<(typeof CAMERA_MODES)[number], string> = {
  orbit: 'Orbit — drag to circle the product',
  fly: 'Fly — WASD to move, drag to look',
}

const MODE_ICONS = { orbit: 'orbit', fly: 'hand' } as const

/**
 * Viewport navigation, on the toolbar.
 *
 * The mouse already does all of this, but only if you know that it does. Naming
 * the gestures as buttons is how someone discovers that the view can be reset
 * at all — and it gives keyboard and trackpad users a way in.
 */
export function ViewportControls() {
  const mode = useAppStore((state) => state.camera.mode)
  const setMode = useAppStore((state) => state.setCameraMode)
  const dollyCamera = useAppStore((state) => state.dollyCamera)
  const frameDevice = useAppStore((state) => state.frameCurrentDevice)
  const resetCamera = useAppStore((state) => state.resetCamera)
  const showGizmos = useAppStore((state) => state.ui.showLightGizmos)
  const toggleGizmos = useAppStore((state) => state.toggleLightGizmos)
  const showAxis = useAppStore((state) => state.ui.showAxisGizmo)
  const toggleAxis = useAppStore((state) => state.toggleAxisGizmo)

  return (
    <div className={styles.cluster} role="group" aria-label="Viewport">
      {CAMERA_MODES.map((value) => (
        <Tooltip key={value} label={MODE_LABELS[value]}>
          <IconButton
            icon={MODE_ICONS[value]}
            label={`${value} mode`}
            size="sm"
            quiet
            active={mode === value}
            onClick={() => setMode(value)}
          />
        </Tooltip>
      ))}

      <span className={styles.divider} aria-hidden="true" />

      <IconButton
        icon="zoomIn"
        label="Zoom in"
        size="sm"
        onClick={() => dollyCamera(1 / ZOOM_STEP)}
      />
      <IconButton
        icon="zoomOut"
        label="Zoom out"
        size="sm"
        onClick={() => dollyCamera(ZOOM_STEP)}
      />
      <IconButton icon="fit" label="Fit device in view" size="sm" onClick={frameDevice} />
      <IconButton icon="reset" label="Reset camera" size="sm" onClick={resetCamera} />
      <IconButton
        icon="light"
        label={showGizmos ? 'Hide light markers' : 'Show light markers'}
        size="sm"
        active={showGizmos}
        onClick={toggleGizmos}
      />
      <IconButton
        icon="target"
        label={showAxis ? 'Hide orientation gizmo' : 'Show orientation gizmo'}
        size="sm"
        active={showAxis}
        onClick={toggleAxis}
      />
    </div>
  )
}
