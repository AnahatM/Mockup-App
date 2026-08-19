import { Link } from 'react-router-dom'
import { Icon } from '@/ui'
import { ROUTES } from '../../routes'
import { Reveal } from './Reveal'
import styles from './ClosingSection.module.css'

/** Closing CTA — the "why trust this" pitch, with a link into the docs. */
export function ClosingSection() {
  return (
    <Reveal>
      <section className={styles.closing}>
        <h2 className={styles.title}>Everything runs on your machine</h2>
        <p className={styles.body}>
          There is no server. Your screenshots are decoded in the browser, the 3D scene renders on
          your GPU, and exports are written straight to your downloads folder. That is not a privacy
          policy — it is the architecture.
        </p>
        <Link to={ROUTES.docs} className={styles.link}>
          <Icon name="book" size={16} />
          Read the documentation
        </Link>
      </section>
    </Reveal>
  )
}
