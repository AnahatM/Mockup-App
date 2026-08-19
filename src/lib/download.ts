/**
 * Triggers a browser download for a blob.
 *
 * The object URL is revoked on a timer rather than immediately: revoking
 * synchronously can cancel the download in some browsers before it has started.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Characters illegal in filenames on Windows or POSIX. */
const ILLEGAL = /[\\/:*?"<>|]+/g
const REPEATED_SEPARATORS = /-{2,}/g
const EDGE_PUNCTUATION = /^[-.\s]+|[-.\s]+$/g

/**
 * Makes a user-typed name safe to use as a filename.
 *
 * Replaces illegal characters, collapses runs of separators, and trims leading
 * and trailing punctuation. That last step matters: without it a name made
 * entirely of illegal characters collapses to a bare "-" and is technically
 * non-empty, so it would slip past the fallback and produce a file called "-".
 */
export function safeFilename(name: string, fallback = 'mockup'): string {
  const cleaned = name
    .replace(ILLEGAL, '-')
    .replace(REPEATED_SEPARATORS, '-')
    .replace(EDGE_PUNCTUATION, '')
  return cleaned.length > 0 ? cleaned : fallback
}

/** Appends a timestamp-free suffix, e.g. `hero` + `png` -> `hero.png`. */
export function withExtension(name: string, extension: string): string {
  return name.toLowerCase().endsWith(`.${extension}`) ? name : `${name}.${extension}`
}

/**
 * Puts an image on the clipboard.
 *
 * Separate from `downloadBlob` because the failure modes are entirely different:
 * the Clipboard API needs a secure context, needs permission, and only accepts a
 * short list of MIME types — PNG being the one that is universally supported.
 * Callers get a boolean so they can fall back to a download rather than leaving
 * the user thinking a copy happened when it did not.
 */
export async function copyImageToClipboard(blob: Blob): Promise<boolean> {
  if (typeof ClipboardItem === 'undefined' || !navigator.clipboard?.write) return false

  try {
    await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])
    return true
  } catch {
    // Denied permission, an insecure context, or an unsupported type. All three
    // mean the same thing to the caller: it did not happen.
    return false
  }
}
