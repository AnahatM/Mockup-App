import { custom, slider } from '@/ui/controls'
import type { Control } from '@/ui/controls'
import { GlbImportPicker, MeshPicker } from '@/features/devices'
import type { AppState } from '@/state/types'

/** The file picker, and the screen-mesh picker that appears once a model has
 *  actually loaded and reported its meshes. */
export const importControls: readonly Control<AppState>[] = [
  custom({ label: 'Import model', bare: true, render: () => <GlbImportPicker /> }),
  custom({
    label: 'Screen mesh',
    bare: true,
    visible: (s) => (s.device.glb?.meshNames.length ?? 0) > 0,
    render: () => <MeshPicker />,
  }),
]

/**
 * Brightness is the one screen property that still makes sense on an
 * imported model — everything else in the Finish/Materials/Details panels is
 * the model's own authored construction, which is the point of importing one.
 */
export const importedScreenControls: readonly Control<AppState>[] = [
  slider({
    label: 'Screen brightness',
    hint: 'How brightly the applied screenshot self-illuminates.',
    min: 0,
    max: 4,
    step: 0.05,
    select: (s) => s.device.screenBrightness,
    update: (d, v) => {
      d.device.screenBrightness = v
    },
  }),
]
