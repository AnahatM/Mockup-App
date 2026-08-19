import { downloadBlob, safeFilename, withExtension } from '@/lib/download'
import { err, type Result } from '@/lib/result'
import { parseManifest } from './migrate'
import type { MockupManifest } from './manifest'

/** Reading a whole preset file into memory; generous but not unbounded. */
const MAX_BYTES = 60 * 1024 * 1024

/** Writes a preset to a `.mockup.json` file. */
export function exportManifest(manifest: MockupManifest): void {
  const json = JSON.stringify(manifest, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  downloadBlob(blob, withExtension(safeFilename(manifest.name), 'mockup.json'))
}

/** Reads a preset file, validating it before it can touch the app's state. */
export async function importManifest(file: File): Promise<Result<MockupManifest>> {
  if (file.size > MAX_BYTES) {
    return err(`${file.name} is too large to be a preset.`)
  }

  let text: string
  try {
    text = await file.text()
  } catch {
    return err(`${file.name} could not be read.`)
  }

  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return err(`${file.name} is not valid JSON.`)
  }

  return parseManifest(raw)
}

/**
 * Encodes a media-less preset into a URL fragment.
 *
 * The fragment rather than the query string, so the scene never reaches a server
 * even if the app is hosted somewhere — which keeps the fully-local promise true
 * of sharing too.
 */
export function toShareFragment(manifest: MockupManifest): string {
  const shareable = { ...manifest, media: { kind: 'none' as const } }
  return encodeURIComponent(
    btoa(unescape(encodeURIComponent(JSON.stringify(shareable)))),
  )
}

export function fromShareFragment(fragment: string): Result<MockupManifest> {
  try {
    const json = decodeURIComponent(escape(atob(decodeURIComponent(fragment))))
    return parseManifest(JSON.parse(json) as unknown)
  } catch {
    return err('That shared link could not be read.')
  }
}
