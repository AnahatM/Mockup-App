import { Outlet, ScrollRestoration } from 'react-router-dom'
import { Footer } from './Footer'
import { Navbar } from './Navbar'
import styles from './SiteShell.module.css'

/**
 * The frame around every page except the studio.
 *
 * The studio is deliberately excluded: it is a fixed-height tool that fills the
 * viewport and manages its own chrome, and squeezing a footer under it would
 * either scroll the canvas away or shrink it for no benefit.
 */
export function SiteShell() {
  return (
    <div className={styles.shell}>
      <ScrollRestoration />
      <Navbar />
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
