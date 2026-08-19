import styles from './Backdrop.module.css'

/**
 * Purely decorative page backdrop: a halftone dot grid plus a few soft, blurred
 * colour blobs for depth. Absolutely positioned behind the page's own content
 * (never the navbar/footer around it), built from CSS gradients only — no images,
 * no network requests — so it re-themes for free from semantic tokens.
 */
export function Backdrop() {
  return (
    <div className={styles.backdrop} aria-hidden="true">
      <div className={styles.dots} />
      <div className={styles.blobPrimary} />
      <div className={styles.blobSecondary} />
      <div className={styles.blobTertiary} />
    </div>
  )
}
