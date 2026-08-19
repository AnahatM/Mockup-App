import { Link } from 'react-router-dom'
import { Icon, type IconName } from '@/ui'
import { LINKS, ROUTES, footerRoutes } from '../routes'
import styles from './Footer.module.css'

/** Icon for each route shown in the footer, keyed by path. */
const ROUTE_ICONS: Record<string, IconName> = {
  [ROUTES.home]: 'home',
  [ROUTES.studio]: 'monitor',
  [ROUTES.docs]: 'book',
  [ROUTES.about]: 'info',
  [ROUTES.privacy]: 'shield',
  [ROUTES.sitemap]: 'map',
}

interface FooterLinkData {
  key: string
  to?: string
  href?: string
  icon: IconName
  label: string
}

/** One footer link — internal (`to`) or external (`href`), always icon + text. */
function FooterLink({ to, href, icon, label }: FooterLinkData) {
  const content = (
    <>
      <Icon name={icon} size={14} className={styles.linkIcon} />
      {label}
    </>
  )
  if (href) {
    return (
      <a className={styles.link} href={href} target="_blank" rel="noreferrer noopener">
        {content}
      </a>
    )
  }
  return (
    <Link to={to ?? ROUTES.home} className={styles.link}>
      {content}
    </Link>
  )
}

const projectLinks: FooterLinkData[] = [
  { key: 'source', href: LINKS.repo, icon: 'github', label: 'Source code' },
  { key: 'issue', href: LINKS.repoIssues, icon: 'external', label: 'Report an issue' },
  { key: 'license', href: LINKS.license, icon: 'shield', label: 'License (MIT)' },
]

const authorLinks: FooterLinkData[] = [
  { key: 'site', href: LINKS.author, icon: 'external', label: 'Anahat Mudgal' },
  { key: 'gh', href: LINKS.authorGithub, icon: 'github', label: 'GitHub' },
]

/** Site footer. Reads its links from the same route table as the navbar. */
export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.about}>
          <p className={styles.name}>
            <Icon name="phone" size={16} />
            Mockup Studio
          </p>
          <p className={styles.tagline}>
            Free, open-source, fully-local 3D mockups. Nothing you load ever
            leaves your device.
          </p>
          <p className={styles.badge}>
            <Icon name="save" size={13} className={styles.linkIcon} />
            Runs entirely on your machine — no uploads, no accounts, no tracking.
          </p>
        </div>

        <nav className={styles.column} aria-label="Pages">
          <h2 className={styles.heading}>Pages</h2>
          {footerRoutes().map((route) => (
            <FooterLink
              key={route.path}
              to={route.path}
              icon={ROUTE_ICONS[route.path] ?? 'dots'}
              label={route.label}
            />
          ))}
        </nav>

        <div className={styles.column}>
          <h2 className={styles.heading}>Project</h2>
          {projectLinks.map(({ key, ...link }) => (
            <FooterLink key={key} {...link} />
          ))}
        </div>

        <div className={styles.column}>
          <h2 className={styles.heading}>Author</h2>
          {authorLinks.map(({ key, ...link }) => (
            <FooterLink key={key} {...link} />
          ))}
        </div>
      </div>

      <p className={styles.legal}>
        <a className={styles.legalLink} href={LINKS.license} target="_blank" rel="noreferrer noopener">
          MIT licensed
        </a>
        . Device models are original procedural approximations; brand names
        describe form factors only and imply no affiliation.
      </p>
    </footer>
  )
}
