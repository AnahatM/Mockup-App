import { ScreenshotSlot } from '@/ui'
import { Reveal } from './Reveal'
import { SHOWCASE_ITEMS } from './content'
import styles from './ShowcaseSection.module.css'

/** Reserved gallery of screenshot/illustration placeholders — swap in real captures later. */
export function ShowcaseSection() {
  return (
    <section className={styles.showcase} aria-label="Screenshots">
      <Reveal className={styles.heading}>
        <h2 className={styles.title}>See it in the studio</h2>
        <p className={styles.body}>Real captures land here — for now, a preview of the shape.</p>
      </Reveal>

      <div className={styles.gallery}>
        {SHOWCASE_ITEMS.map((item, index) => (
          <Reveal key={item.caption} delay={index * 80}>
            <ScreenshotSlot caption={item.caption} icon={item.icon} aspect="wide" />
          </Reveal>
        ))}
      </div>
    </section>
  )
}
