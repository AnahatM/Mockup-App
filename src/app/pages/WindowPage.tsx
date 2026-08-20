import { FlatStudio } from '@/features/flat'
import { useDocumentTitle } from '../useDocumentTitle'
import styles from './WindowPage.module.css'

/**
 * The 2D window mockup tool, on its own route.
 *
 * Deliberately separate from the 3D studio — see ADR 0006. The compositor
 * behind it is plain Canvas 2D, so this page works on hardware and in browsers
 * where the studio cannot run at all, and someone who wants a browser frame
 * around a screenshot does not have to go looking inside a 3D studio for it.
 *
 * It keeps the site navbar, unlike the studio: this is a page rather than a
 * fixed-frame tool, and there is no canvas for a scrollbar to fight with.
 */
export function WindowPage() {
  useDocumentTitle('Window mockups')

  return (
    <div className={styles.page}>
      <FlatStudio />
    </div>
  )
}
