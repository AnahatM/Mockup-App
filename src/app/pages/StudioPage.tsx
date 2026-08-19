import { useEffect } from 'react'
import { Navbar } from '../site/Navbar'
import { AppShell } from '../layout/AppShell'
import styles from './StudioPage.module.css'

/**
 * The studio, at its own route.
 *
 * It carries the site navbar like every other page — the studio's own controls
 * sit on a second bar beneath it — so the app's identity and navigation never
 * move out from under the user when they open the tool. The footer stays off:
 * this is a fixed-frame view, and a footer below it would either scroll the
 * canvas away or shrink it for nothing.
 *
 * Page scrolling is locked for its lifetime for the same reason. The site pages
 * around it scroll normally.
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
      <Navbar />
      <div className={styles.shell}>
        <AppShell />
      </div>
    </div>
  )
}
