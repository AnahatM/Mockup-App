import { AuthorCredit } from './landing/AuthorCredit'
import { Backdrop } from './landing/Backdrop'
import { ClosingSection } from './landing/ClosingSection'
import { FeatureGrid } from './landing/FeatureGrid'
import { Hero } from './landing/Hero'
import { ShowcaseSection } from './landing/ShowcaseSection'
import styles from './LandingPage.module.css'

export function LandingPage() {
  return (
    <div className={styles.page}>
      <Backdrop />
      <div className={styles.authorRow}>
        <AuthorCredit />
      </div>
      <Hero />
      <FeatureGrid />
      <ShowcaseSection />
      <ClosingSection />
    </div>
  )
}
