import { useMemo } from 'react'
import { EmptyState, Swatch } from '@/ui'
import { mediaPalette } from '@/features/media/schema'
import { useAppStore } from '@/state/store'
import { deriveBackdrops, type AdaptiveBackdrop } from './adaptive'
import styles from './AdaptiveBackdrops.module.css'

/**
 * One-click gradient backdrops built from the uploaded screenshot's own
 * colours.
 *
 * The existing palette picker drops one colour into one slot; this sets a whole
 * coordinated backdrop — mode, both stops and the sweep angle — because those
 * four values only look right chosen together. See `adaptive.ts` for the
 * recipes and for why none of them simply reuses the dominant colour.
 */
export function AdaptiveBackdrops() {
  // Select the source, then derive. Deriving *inside* the selector is what
  // took the Scene tab down: a selector runs on every store read and its
  // result is compared by identity, so one that builds a new array or object
  // never settles. Nothing here may call a function that allocates.
  const source = useAppStore((state) => state.media.source)
  const applyAdaptiveBackdrop = useAppStore((state) => state.applyAdaptiveBackdrop)
  const current = useAppStore((state) => state.scene.backdrop)

  const options = useMemo(() => deriveBackdrops(mediaPalette(source)), [source])

  if (options.length === 0) {
    return (
      <EmptyState
        icon="image"
        title="No colours to match yet"
        description="Upload a screenshot and its palette becomes a set of backdrops here."
      />
    )
  }

  return (
    <div className={styles.grid}>
      {options.map((option) => (
        <Swatch
          key={option.id}
          // A generated gradient is user data, not design, so it cannot come
          // from a token — same reason `Swatch` takes a colour string at all.
          color={preview(option)}
          label={option.label}
          selected={
            current.mode === option.config.mode &&
            current.color === option.config.color &&
            current.accent === option.config.accent
          }
          onSelect={() => applyAdaptiveBackdrop(option.id)}
        />
      ))}
    </div>
  )
}

/** The swatch chip, painted the way the backdrop itself will be. */
function preview({ config }: AdaptiveBackdrop): string {
  if (config.mode === 'glow') {
    return `radial-gradient(circle at 50% 45%, ${config.accent}, ${config.color})`
  }
  return `linear-gradient(${config.angle}rad, ${config.color}, ${config.accent})`
}
