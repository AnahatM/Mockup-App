import { Link } from 'react-router-dom'
import { cx } from '@/lib/cx'
import { LINKS, footerRoutes } from '../routes'
import styles from './Footer.module.css'

/** Site footer. Reads its links from the same route table as the navbar. */
export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.about}>
          <p className={styles.name}>Mockup Studio</p>
          <p className={styles.tagline}>
            Free, open-source, fully-local 3D mockups. Nothing you load ever
            leaves your device.
          </p>
        </div>

        <nav className={styles.column} aria-label="Pages">
          <h2 className={styles.heading}>Pages</h2>
          {footerRoutes().map((route) => (
            <Link key={route.path} to={route.path} className={cx(styles.link)}>
              {route.label}
            </Link>
          ))}
        </nav>

        <div className={styles.column}>
          <h2 className={styles.heading}>Project</h2>
          <a className={styles.link} href={LINKS.repo} target="_blank" rel="noreferrer noopener">
            Source code
          </a>
          <a
            className={styles.link}
            href={`${LINKS.repo}/issues`}
            target="_blank"
            rel="noreferrer noopener"
          >
            Report an issue
          </a>
          <Link to="/sitemap" className={cx(styles.link)}>
            Sitemap
          </Link>
        </div>

        <div className={styles.column}>
          <h2 className={styles.heading}>Author</h2>
          <a className={styles.link} href={LINKS.author} target="_blank" rel="noreferrer noopener">
            Anahat Mudgal
          </a>
          <a
            className={styles.link}
            href={LINKS.authorGithub}
            target="_blank"
            rel="noreferrer noopener"
          >
            GitHub
          </a>
        </div>
      </div>

      <p className={styles.legal}>
        MIT licensed. Device models are original procedural approximations; brand
        names describe form factors only and imply no affiliation.
      </p>
    </footer>
  )
}
