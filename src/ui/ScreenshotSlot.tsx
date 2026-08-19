import { cx } from '@/lib/cx'
import { Icon } from './Icon'
import type { IconName } from './icons'
import styles from './ScreenshotSlot.module.css'

export interface ScreenshotSlotProps {
  /** Shown under the frame, and as the image's alt text unless `alt` is given. */
  caption: string
  /** Real screenshot/illustration to display. Omit to render the empty placeholder. */
  src?: string
  alt?: string
  /** Icon shown inside the empty placeholder. */
  icon?: IconName
  aspect?: 'wide' | 'tall' | 'square'
  className?: string | undefined
}

/**
 * A reserved slot for a screenshot or illustration. With no `src` it renders a
 * deliberate, nicely-framed empty state — not a broken image — so the page looks
 * finished before real imagery exists. Passing `src` later swaps in the real thing
 * without touching layout.
 */
export function ScreenshotSlot({
  caption,
  src,
  alt = caption,
  icon = 'image',
  aspect = 'wide',
  className,
}: ScreenshotSlotProps) {
  return (
    <figure className={cx(styles.slot, className)}>
      <div className={cx(styles.frame, styles[aspect])}>
        {src ? (
          <img className={styles.image} src={src} alt={alt} loading="lazy" />
        ) : (
          <div className={styles.empty}>
            <span className={styles.emptyGlyph}>
              <Icon name={icon} size={22} />
            </span>
            <span className={styles.emptyLabel}>Screenshot coming soon</span>
          </div>
        )}
      </div>
      <figcaption className={styles.caption}>{caption}</figcaption>
    </figure>
  )
}
