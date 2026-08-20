import { cropRectToPixels } from './geometry'
import type { CropRect } from './schema'

export interface BakedCrop {
  url: string
  width: number
  height: number
}

/**
 * Rasterises `rect` of the image at `url` into a new canvas and returns the
 * result as a `data:` URL.
 *
 * WHERE THE CROP IS APPLIED — the design decision this module embodies:
 *
 * Two designs were on the table. (1) Store the crop rect and compose it into
 * `texture.repeat`/`.offset` on the GPU, alongside the existing fit/zoom/pan
 * pipeline (`lib/media/fit.ts`). (2) Bake the crop into new pixels once, and
 * swap the result in as the active media source.
 *
 * (2) is what this module does, because `texture.repeat`/`.offset` on the
 * device's screen already has a single owner: `DeviceScreen`'s fit/zoom/pan
 * effect, which unconditionally `.set()`s both every render. Composing a
 * second, independent UV transform from a different feature onto the same
 * three.js object would mean two systems racing to write the same GPU state
 * — whichever effect committed last would silently discard the other's
 * crop or zoom. Baking sidesteps that entirely: the output is an ordinary
 * `MediaSource` (a new url, with the cropped pixel dimensions). Everything
 * downstream — `mediaAspect()`, `useScreenTexture`, the flat/window feature,
 * and every export path — already treats `media.source` generically, so the
 * crop reaches the device and every export for free, with no changes to any
 * of them.
 *
 * A `data:` URL rather than `URL.createObjectURL` is deliberate too: it needs
 * no revocation, which keeps this feature out of the object-URL ownership
 * ledger `features/media/recents.ts` maintains for the pristine upload —
 * nothing new is ever added to it.
 *
 * VIDEO IS OUT OF SCOPE, on purpose: baking a frame this way is inherently a
 * one-off still-image operation. Applying it to a *playing* video would mean
 * either redrawing a `<canvas>` 30-60 times a second — defeating the entire
 * point of a GPU-native `VideoTexture`, which is that the browser decodes
 * and uploads frames without the main thread touching pixels — or writing to
 * `texture.repeat`/`.offset` after all, which is exactly the single-owner
 * conflict described above. The crop control is hidden whenever the loaded
 * media is a video; see `hasCroppableImage` in `screenContentControls.tsx`.
 */
export async function bakeCrop(
  url: string,
  naturalWidth: number,
  naturalHeight: number,
  rect: CropRect,
): Promise<BakedCrop> {
  const image = await loadImage(url)
  const px = cropRectToPixels(rect, naturalWidth, naturalHeight)

  const canvas = document.createElement('canvas')
  canvas.width = px.width
  canvas.height = px.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context is unavailable.')

  ctx.drawImage(image, px.x, px.y, px.width, px.height, 0, 0, px.width, px.height)
  return { url: canvas.toDataURL('image/png'), width: px.width, height: px.height }
}

/** Reloads the original upload from its (local) url — cheap, since it never
 * leaves the browser's cache — so the bake always starts from source pixels
 * rather than compounding quality loss across repeated crops. */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Could not reload the image to crop it.'))
    image.src = url
  })
}
