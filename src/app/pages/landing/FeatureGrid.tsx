import { Icon } from '@/ui'
import { Reveal } from './Reveal'
import { HIGHLIGHTS } from './content'
import styles from './FeatureGrid.module.css'

/** The feature-highlight card grid, each card revealing in as it scrolls into view. */
export function FeatureGrid() {
  return (
    <section className={styles.grid} aria-label="Features">
      {HIGHLIGHTS.map((item, index) => (
        <Reveal key={item.title} delay={index * 60}>
          <article className={styles.card}>
            <Icon name={item.icon} size={18} className={styles.cardIcon} />
            <h2 className={styles.cardTitle}>{item.title}</h2>
            <p className={styles.cardBody}>{item.body}</p>
          </article>
        </Reveal>
      ))}
    </section>
  )
}
