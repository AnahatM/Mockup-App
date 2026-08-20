import { AuthorCredit } from './landing/AuthorCredit'
import { Backdrop } from './landing/Backdrop'
import { ClosingSection } from './landing/ClosingSection'
import { FeatureGrid } from './landing/FeatureGrid'
import { Hero } from './landing/Hero'
import { ShowcaseSection } from './landing/ShowcaseSection'
import styles from './LandingPage.module.css'

/**
 * `.page` is full-bleed and clips the backdrop at the viewport edge; the
 * centred reading column lives one level down in `.inner`, so the backdrop
 * never has to escape a `max-width` parent to reach the screen edge.
 */
export function LandingPage() {
  return (
    <div className={styles.page}>
      <Backdrop />
      <div className={styles.inner}>
        <div className={styles.authorRow}>
          <AuthorCredit />
        </div>
        <Hero />
        <FeatureGrid />
        <ShowcaseSection />
        <ClosingSection />
      </div>
    </div>
  )
}
