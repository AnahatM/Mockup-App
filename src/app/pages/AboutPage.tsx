import {
  Contributing,
  HowItIsBuilt,
  WhatIsInIt,
  WhoMadeIt,
  WhyItExists,
} from './AboutSections'
import styles from './Prose.module.css'

/**
 * About the project.
 *
 * Written as prose rather than a feature list — the feature list is the landing
 * page's job. This answers why the thing exists and how it is built, which is
 * what someone deciding whether to trust or contribute to an open-source project
 * actually wants to know.
 */
export function AboutPage() {
  return (
    <article className={styles.page}>
      <h1 className={styles.title}>About Mockup Studio</h1>
      <p className={styles.lede}>
        A free, open-source mockup generator that renders your screenshots on real 3D
        devices — built because every good alternative is a subscription, and every free
        one is a watermark.
      </p>

      <WhyItExists />
      <HowItIsBuilt />
      <WhatIsInIt />
      <Contributing />
      <WhoMadeIt />
    </article>
  )
}
