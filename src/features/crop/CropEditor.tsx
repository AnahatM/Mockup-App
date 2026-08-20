import { useRef, useState } from 'react'
import { resolveDevice } from '@/features/devices'
import { useAppStore } from '@/state/store'
import { Button, SegmentedControl } from '@/ui'
import { CropOverlay } from './CropOverlay'
import { cropAspectOptions } from './deviceAspect'
import { dragCropRect, rectForAspect, type CropHandle } from './geometry'
import { useCropCommit } from './useCropCommit'
import { useCropDrag } from './useCropDrag'
import type { CropAspectPreset, CropRect } from './schema'
import styles from './CropEditor.module.css'

/**
 * The crop tool for the uploaded screenshot.
 *
 * Shows the ORIGINAL upload, never the (possibly already-cropped) active
 * source — otherwise a second crop would narrow what a third could ever
 * select from. Dragging updates only local state, so the overlay tracks the
 * pointer instantly; the store (and the re-baked 3D texture) is only
 * committed on release, which keeps a drag smooth regardless of image size.
 * See `useCropCommit.ts` for the commit itself.
 */
export function CropEditor() {
  const original = useAppStore((state) => state.media.original)
  const crop = useAppStore((state) => state.screen.crop)
  const specId = useAppStore((state) => state.device.specId)
  const setAspectPreset = useAppStore((state) => state.setCropAspectPreset)
  const resetCrop = useAppStore((state) => state.resetCrop)
  const commit = useCropCommit()

  const containerRef = useRef<HTMLDivElement>(null)
  const [liveRect, setLiveRect] = useState<CropRect | null>(null)

  // Hooks below need safe fallbacks regardless of `original.kind`, because
  // they must run unconditionally — the "nothing to crop" bail-out has to
  // come after every hook call, not before.
  const mediaAspect = original.kind === 'image' ? original.width / original.height : 1
  const options = cropAspectOptions(resolveDevice(specId))
  const lockAspect = options.find((option) => option.id === crop.aspectPreset)?.ratio ?? null
  const rect = liveRect ?? crop.rect

  const drag = useCropDrag({
    containerRef,
    rect,
    lockAspect,
    mediaAspect,
    onChange: setLiveRect,
    onCommit: (next) => {
      setLiveRect(null)
      commit(next)
    },
  })

  if (original.kind !== 'image') return null

  const selectPreset = (id: CropAspectPreset) => {
    setAspectPreset(id)
    const ratio = options.find((option) => option.id === id)?.ratio
    if (ratio != null) commit(rectForAspect(ratio, mediaAspect))
  }

  const nudge = (handle: CropHandle, dx: number, dy: number) =>
    commit(dragCropRect({ start: rect, handle, dx, dy, lockAspect, mediaAspect }))

  return (
    <div className={styles.wrap}>
      <SegmentedControl
        value={crop.aspectPreset}
        onChange={selectPreset}
        segments={options.map((option) => ({ value: option.id, label: option.label }))}
        label="Crop aspect"
      />

      <div ref={containerRef} className={styles.frame} style={{ aspectRatio: mediaAspect }}>
        <img src={original.url} alt="" className={styles.image} draggable={false} />
        <CropOverlay
          rect={rect}
          onHandlePointerDown={drag.startDrag}
          onPointerMove={drag.onPointerMove}
          onPointerUp={drag.endDrag}
          onKeyNudge={nudge}
        />
      </div>

      <div className={styles.footer}>
        <p className={styles.hint}>Drag a handle, or focus one and use the arrow keys.</p>
        <Button
          variant="subtle"
          size="sm"
          onClick={() => {
            resetCrop()
            setAspectPreset('free')
          }}
        >
          Reset crop
        </Button>
      </div>
    </div>
  )
}
