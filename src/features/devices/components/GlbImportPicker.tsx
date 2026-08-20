import { useRef } from 'react'
import { Button, Icon, Tooltip } from '@/ui'
import { useAppStore } from '@/state/store'
import styles from './GlbImportPicker.module.css'

const ACCEPT = '.glb,.gltf,model/gltf-binary,model/gltf+json'

/** A soft ceiling — large enough for a genuinely detailed model, small enough
 *  to warn before the tab struggles to parse or render it. Not a hard block:
 *  a big file might still load fine, just slowly. */
const SIZE_WARNING_BYTES = 200 * 1024 * 1024

/**
 * Loads a user-supplied `.glb`/`.gltf` model from their own machine.
 *
 * A file picker rather than a bundled catalogue entry, for the same reason as
 * `HdriPicker`: shipping sample models would mean megabytes in the repo, and
 * the app never fetches one from a CDN. A file the user already has stays a
 * file on their machine.
 */
export function GlbImportPicker() {
  const glb = useAppStore((state) => state.device.glb)
  const error = useAppStore((state) => state.glbError)
  const importGlbModel = useAppStore((state) => state.importGlbModel)
  const clearGlbModel = useAppStore((state) => state.clearGlbModel)
  const setGlbError = useAppStore((state) => state.setGlbError)
  const input = useRef<HTMLInputElement>(null)

  const accept = (file: File | undefined) => {
    if (!file) return
    if (!/\.(glb|gltf)$/i.test(file.name)) {
      setGlbError('Models must be a .glb or .gltf file.')
      return
    }
    importGlbModel(URL.createObjectURL(file), file.name)
    if (file.size > SIZE_WARNING_BYTES) {
      const mb = Math.round(file.size / (1024 * 1024))
      setGlbError(`${file.name} is ${mb} MB — large models can be slow to load.`)
    }
  }

  return (
    <div className={styles.wrap}>
      <input
        ref={input}
        type="file"
        accept={ACCEPT}
        className={styles.input}
        onChange={(event) => {
          accept(event.currentTarget.files?.[0])
          event.currentTarget.value = ''
        }}
      />

      {glb ? (
        <div className={styles.loaded}>
          <Icon name="upload" size={14} className={styles.icon} />
          <Tooltip label={glb.name} className={styles.name}>
            <span className={styles.nameText}>{glb.name}</span>
          </Tooltip>
          <Button size="sm" variant="subtle" onClick={clearGlbModel}>
            Remove
          </Button>
        </div>
      ) : (
        <Button icon="upload" size="sm" fullWidth onClick={() => input.current?.click()}>
          Import .glb / .gltf
        </Button>
      )}

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <p className={styles.hint}>
        Uses the model&apos;s own materials — colour and finish controls below
        apply to built-in devices only. It never leaves your machine.
      </p>
    </div>
  )
}
