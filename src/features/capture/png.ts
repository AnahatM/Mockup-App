import { PerspectiveCamera, Vector2 } from 'three'
import type { Camera, Scene, WebGLRenderer } from 'three'
import { hideGizmosForCapture } from '@/features/lighting'

export interface CapturePngOptions {
  renderer: WebGLRenderer
  scene: Scene
  camera: Camera
  width: number
  height: number
  /** Render with no background so the PNG keeps its alpha. */
  transparent: boolean
  /** Renders one frame. Supplied by the caller so the effect composer is used. */
  render: () => void
}

/**
 * Renders one frame at an arbitrary resolution and returns it as a PNG blob.
 *
 * The renderer is temporarily resized rather than the on-screen canvas being
 * scaled up, so export quality is independent of the browser window — a 4K
 * export from a laptop screen is genuinely 4K, not an upscale.
 *
 * Everything mutated is restored in a `finally`. Leaving the renderer at export
 * size, or the scene without its background, would visibly break the running app
 * if anything threw midway.
 */
export async function capturePng({
  renderer,
  scene,
  camera,
  width,
  height,
  transparent,
  render,
}: CapturePngOptions): Promise<Blob | null> {
  const previousSize = renderer.getSize(new Vector2())
  const previousPixelRatio = renderer.getPixelRatio()
  const previousBackground = scene.background
  const previousAspect = camera instanceof PerspectiveCamera ? camera.aspect : null

  // Gizmos are an editing aid and must never reach an export. Hidden for the
  // whole capture window — including the async `toBlob` wait, since the
  // canvas is a continuous render loop and could otherwise repaint before the
  // pixels are read back — and only restored once the blob is in hand. See
  // gizmoCaptureGuard for why this is a direct three.js mutation rather than
  // a store flag.
  const restoreGizmos = hideGizmosForCapture()

  try {
    if (transparent) scene.background = null

    // Pixel ratio is forced to 1 because `width`/`height` are already the exact
    // pixel dimensions asked for; letting DPR multiply them would silently
    // double the export on a retina display.
    renderer.setPixelRatio(1)
    renderer.setSize(width, height, false)

    if (camera instanceof PerspectiveCamera) {
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }

    render()
    return await toBlob(renderer.domElement)
  } finally {
    restoreGizmos()
    scene.background = previousBackground
    renderer.setPixelRatio(previousPixelRatio)
    renderer.setSize(previousSize.x, previousSize.y, false)
    if (camera instanceof PerspectiveCamera && previousAspect !== null) {
      camera.aspect = previousAspect
      camera.updateProjectionMatrix()
    }
    render()
  }
}

function toBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
}
