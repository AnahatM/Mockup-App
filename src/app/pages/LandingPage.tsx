import { Link } from 'react-router-dom'
import { cx } from '@/lib/cx'
import { Icon, type IconName } from '@/ui'
import { DEVICES } from '@/features/devices'
import { LINKS, ROUTES } from '../routes'
import styles from './LandingPage.module.css'

interface Highlight {
  icon: IconName
  title: string
  body: string
}

const HIGHLIGHTS: readonly Highlight[] = [
  {
    icon: 'phone',
    title: 'Procedural devices',
    body: 'Phones, folding phones, tablets, laptops, monitors and watches — each a data file, so every dimension and colour is yours to change.',
  },
  {
    icon: 'image',
    title: 'Screenshots or video',
    body: 'Drop in a PNG or an MP4. A screen recording plays on the device and records into your export.',
  },
  {
    icon: 'light',
    title: 'Parametric studio lighting',
    body: 'Rim lights, glows and a soft room you can shape — or load your own HDRI for natural light.',
  },
  {
    icon: 'droplet',
    title: 'Match your brand',
    body: 'The dominant colours of your screenshot become one-click sources for the backdrop, the lights and the device itself.',
  },
  {
    icon: 'window',
    title: '2D window mockups',
    body: 'macOS and browser chrome with traffic lights and a custom title bar — flat, or displayed on a laptop in the 3D scene.',
  },
  {
    icon: 'film',
    title: 'Stills and video',
    body: 'PNG at any resolution with real transparency, plus WebM recording of any motion preset.',
  },
]

export function LandingPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Free · Open source · Runs entirely offline</p>
        <h1 className={styles.title}>
          Studio-grade mockups,
          <br />
          without the studio.
        </h1>
        <p className={styles.lede}>
          Drop in a screenshot and render it on a real device inside a 3D studio you
          control. No account, no upload, no watermark — and nothing you load ever
          leaves your machine.
        </p>

        <div className={styles.actions}>
          <Link to={ROUTES.studio} className={cx(styles.primary)}>
            <Icon name="camera" size={16} />
            Open the studio
          </Link>
          <a
            className={styles.secondary}
            href={LINKS.repo}
            target="_blank"
            rel="noreferrer noopener"
          >
            View source
          </a>
        </div>

        <p className={styles.stat}>
          {DEVICES.length} devices · 12 presets · 9 camera angles · 9 motion clips
        </p>
      </section>

      <section className={styles.grid} aria-label="Features">
        {HIGHLIGHTS.map((item) => (
          <article key={item.title} className={styles.card}>
            <Icon name={item.icon} size={18} className={styles.cardIcon} />
            <h2 className={styles.cardTitle}>{item.title}</h2>
            <p className={styles.cardBody}>{item.body}</p>
          </article>
        ))}
      </section>

      <section className={styles.closing}>
        <h2 className={styles.closingTitle}>Everything runs on your machine</h2>
        <p className={styles.closingBody}>
          There is no server. Your screenshots are decoded in the browser, the 3D scene
          renders on your GPU, and exports are written straight to your downloads
          folder. That is not a privacy policy — it is the architecture.
        </p>
        <Link to={ROUTES.docs} className={cx(styles.secondary)}>
          Read the documentation
        </Link>
      </section>
    </div>
  )
}
