import { custom } from '@/ui/controls'
import type { Control } from '@/ui/controls'
import { AdaptiveBackdrops } from '@/features/scene'
import type { AppState } from '@/state/types'

/**
 * Backdrops derived from the uploaded screenshot.
 *
 * A `custom` control rather than a schema of knobs, for the same reason the
 * media dropzone and the preset list are: what this offers is a gallery of
 * generated results, not a set of values to type.
 */
export const adaptiveBackdropControls: readonly Control<AppState>[] = [
  custom({
    label: 'Match your screenshot',
    hint: 'Gradients built from the colours in the media you uploaded.',
    bare: true,
    render: () => <AdaptiveBackdrops />,
  }),
]
