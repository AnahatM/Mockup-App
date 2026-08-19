import { cx } from '@/lib/cx'
import { Icon } from '@/ui'
import { useAppStore } from '@/state/store'
import { devicesByCategory } from '../spec/registry'
import styles from './DeviceRail.module.css'

/** The device library. Reads straight from the catalogue registry. */
export function DeviceRail() {
  const selected = useAppStore((state) => state.device.specId)
  const selectDevice = useAppStore((state) => state.selectDevice)
  const groups = devicesByCategory()

  return (
    <nav className={styles.rail} aria-label="Device library">
      {[...groups].map(([category, devices]) => (
        <section key={category} className={styles.group}>
          <h2 className={styles.heading}>{category}</h2>
          <ul>
            {devices.map((device) => (
              <li key={device.id}>
                <button
                  type="button"
                  aria-pressed={device.id === selected}
                  className={cx(styles.item, device.id === selected && styles.selected)}
                  onClick={() => selectDevice(device.id)}
                >
                  <Icon name={device.icon} size={14} className={styles.icon} />
                  <span className={styles.name}>{device.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </nav>
  )
}
