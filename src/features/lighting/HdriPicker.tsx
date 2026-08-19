import { useRef, useState } from 'react'
import { Button, Icon, Tooltip } from '@/ui'
import { useAppStore } from '@/state/store'
import styles from './HdriPicker.module.css'

const ACCEPT = '.hdr,.exr,image/vnd.radiance,image/x-exr'

/**
 * Loads a user-supplied environment map for natural lighting.
 *
 * Deliberately a file picker rather than a bundled library. Shipping HDRIs would
 * mean either megabytes in the repo or fetching them from a CDN, and the CDN
 * option breaks the fully-local promise that the rest of the app is built on.
 * A file the user already has stays a file on their machine.
 */
export function HdriPicker() {
  const hdri = useAppStore((state) => state.lighting.hdri)
  const setHdri = useAppStore((state) => state.setHdri)
  const clearHdri = useAppStore((state) => state.clearHdri)
  const [error, setError] = useState<string | null>(null)
  const input = useRef<HTMLInputElement>(null)

  const accept = (file: File | undefined) => {
    if (!file) return
    if (!/\.(hdr|exr)$/i.test(file.name)) {
      setError('Environment maps must be .hdr or .exr files.')
      return
    }
    setError(null)
    setHdri(URL.createObjectURL(file), file.name)
  }

  return (
    <div className={styles.wrap}>
      <input
        ref={input}
        type="file"
        accept={ACCEPT}
        className={styles.input}
        onChange={(event) => accept(event.currentTarget.files?.[0])}
      />

      {hdri ? (
        <div className={styles.loaded}>
          <Icon name="image" size={14} className={styles.icon} />
          <Tooltip label={hdri.name} className={styles.name}>
            <span className={styles.nameText}>{hdri.name}</span>
          </Tooltip>
          <Button size="sm" variant="subtle" onClick={clearHdri}>
            Remove
          </Button>
        </div>
      ) : (
        <Button
          icon="upload"
          size="sm"
          fullWidth
          onClick={() => input.current?.click()}
        >
          Load .hdr / .exr
        </Button>
      )}

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <p className={styles.hint}>
        Free HDRIs: polyhaven.com, ambientcg.com, hdri-skies.com. Download one and load
        it here — it never leaves your machine.
      </p>
    </div>
  )
}
