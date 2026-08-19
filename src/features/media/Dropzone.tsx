import { useCallback, useRef, useState } from 'react'
import { cx } from '@/lib/cx'
import { useAppStore } from '@/state/store'
import { useBusy } from '@/state/useBusy'
import { loadMediaFile } from './decode'
import { DropzoneContent } from './DropzoneContent'
import styles from './Dropzone.module.css'

const ACCEPT = 'image/*,video/mp4,video/webm,video/ogg,video/quicktime'

/**
 * Drop target and file picker for the screen content.
 *
 * Accepts a screenshot or a screen recording. Everything is handled locally —
 * the file becomes an object URL and is never uploaded anywhere.
 */
export function Dropzone() {
  const source = useAppStore((state) => state.media.source)
  const error = useAppStore((state) => state.media.error)
  const loading = useAppStore((state) => state.media.loading)
  const setSource = useAppStore((state) => state.setMediaSource)
  const setError = useAppStore((state) => state.setMediaError)
  const setLoading = useAppStore((state) => state.setMediaLoading)
  const clearMedia = useAppStore((state) => state.clearMedia)

  const busy = useBusy()
  const [dragging, setDragging] = useState(false)
  const input = useRef<HTMLInputElement>(null)

  const accept = useCallback(
    async (file: File | undefined) => {
      if (!file) return
      setLoading(true)
      // Decoding a large screen recording is slow enough to look like a hang.
      const result = await busy(() => loadMediaFile(file))
      if (result.ok) setSource(result.value)
      else setError(result.error)
    },
    [busy, setLoading, setSource, setError],
  )

  return (
    <div className={styles.wrap}>
      <div
        className={cx(styles.zone, dragging && styles.dragging)}
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          void accept(event.dataTransfer.files[0])
        }}
      >
        <input
          ref={input}
          type="file"
          accept={ACCEPT}
          className={styles.input}
          onChange={(event) => void accept(event.currentTarget.files?.[0])}
        />
        <DropzoneContent
          source={source}
          loading={loading}
          onChoose={() => input.current?.click()}
          onClear={clearMedia}
        />
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
