import { Link } from 'react-router-dom'
import { cx } from '@/lib/cx'
import { Icon, ScreenshotSlot } from '@/ui'
import heroShot from '@/assets/shots/hero-studio.png'
import { LINKS, ROUTES } from '../../routes'
import { StatRow } from './StatRow'
import { useTilt } from './useTilt'
import styles from './Hero.module.css'

/** The page's opening section: pitch, primary actions, stats, and a tilting showcase slot. */
export function Hero() {
  const tiltRef = useTilt<HTMLDivElement>(5)

  return (
    <section className={styles.hero}>
      <div className={styles.copy}>
        <p className={styles.eyebrow}>
          <Icon name="sparkle" size={13} />
          Free · Open source · Runs entirely offline
        </p>
        <h1 className={styles.title}>
          Studio-grade mockups,
          <br />
          <span className={cx(styles.titleAccent, 'gradientText')}>
            without the studio.
          </span>
        </h1>
        <p className={styles.lede}>
          Drop in a screenshot and render it on a{' '}
          <strong className={styles.emphasis}>parametric</strong> device — generated
          from data, not modelled by hand — inside a fully{' '}
          <strong className={styles.emphasis}>customizable</strong> 3D studio. No
          account, no upload, no watermark, and nothing you load ever leaves your
          machine.
        </p>

        <div className={styles.actions}>
          <Link to={ROUTES.studio} className={styles.primary}>
            <Icon name="camera" size={16} />
            Open the studio
          </Link>
          <a
            className={styles.secondary}
            href={LINKS.repo}
            target="_blank"
            rel="noreferrer noopener"
          >
            <Icon name="github" size={16} />
            View source
          </a>
        </div>

        <StatRow />
      </div>

      <div ref={tiltRef} className={styles.showcase}>
        <ScreenshotSlot
          caption="The studio, mid-render"
          src={heroShot}
          aspect="tall"
          className={styles.showcaseSlot}
        />
      </div>
    </section>
  )
}
