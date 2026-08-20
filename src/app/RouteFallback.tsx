import { Spinner } from '@/ui'
import styles from './RouteFallback.module.css'

/**
 * Shown while a lazily-loaded route's chunk arrives.
 *
 * Deliberately quiet and centred rather than a skeleton of the page: the two
 * split routes look nothing alike, and a skeleton that guesses wrong is more
 * jarring than a spinner that does not guess.
 */
export function RouteFallback() {
  return (
    <div className={styles.fallback}>
      <Spinner label="Loading" />
    </div>
  )
}
