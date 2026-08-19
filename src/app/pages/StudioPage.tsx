import { useEffect } from 'react'
import { AppShell } from '../layout/AppShell'
import styles from './StudioPage.module.css'

/**
 * The studio, at its own route.
 *
 * It locks page scrolling for its lifetime: the studio is a fixed-frame tool
 * that fills the viewport, and a scrollbar behind it would let the canvas be
 * dragged out of view. The site pages around it scroll normally.
 */
export function StudioPage() {
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  return (
    <div className={styles.studio}>
      <AppShell />
    </div>
  )
}
