import { Icon } from '@/ui'
import { LINKS } from '../../routes'
import styles from './AuthorCredit.module.css'

/** Top-of-page byline, linking out to the author's site. */
export function AuthorCredit() {
  return (
    <a className={styles.credit} href={LINKS.author} target="_blank" rel="noreferrer noopener">
      <Icon name="external" size={12} />
      Made by Anahat Mudgal
    </a>
  )
}
