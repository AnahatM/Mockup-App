import { Icon } from '@/ui'
import { STATS } from './content'
import styles from './StatRow.module.css'

/** Small row of stat chips under the hero actions — devices, presets, angles, clips. */
export function StatRow() {
  return (
    <dl className={styles.row}>
      {STATS.map((stat) => (
        <div key={stat.label} className={styles.stat}>
          <Icon name={stat.icon} size={14} className={styles.icon} />
          <dt className={styles.value}>{stat.value}</dt>
          <dd className={styles.label}>{stat.label}</dd>
        </div>
      ))}
    </dl>
  )
}
