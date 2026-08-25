import { glyph, type OverlayCanvas } from './context'
import { pointScale, type ReferenceScreen } from './points'
import type { OverlaysConfig } from '../schema'

/**
 * The macOS menu bar: the fruit, an app name in bold, its menus, and a clock.
 *
 * The apple used to be a plain filled circle, which read as a bullet point.
 * `drawApple` builds a silhouette out of primitives — two overlapping lobes, a
 * bite taken out of the right, a leaf on top — rather than tracing Apple's
 * registered mark, which is the same line every mockup tool draws and the same
 * one the traffic lights on the window chrome already sit on.
 *
 * The menu titles are Finder's, because Finder is what is frontmost on a Mac
 * showing a desktop, and a menu bar reading "File / Edit / View" with no app
 * name in front of it is the tell that a mockup was faked.
 */
const MENUS = ['Finder', 'File', 'Edit', 'View', 'Go', 'Window', 'Help']

/**
 * macOS's menu bar is 24pt tall on every display it runs on, and its titles are
 * 13pt. Converted once from the reference screen — see `points.ts` — rather
 * than kept as a share of the canvas, which is how it ended up quoted against a
 * nominal 1080pt-tall display that no Mac actually has.
 */
const BAR_HEIGHT_PT = 24
const TITLE_PT = 13

export function drawMenuBar(
  canvas: OverlayCanvas,
  config: OverlaysConfig,
  reference: ReferenceScreen,
): void {
  const { ctx, width } = canvas
  const pt = pointScale(canvas, reference)
  const barHeight = BAR_HEIGHT_PT * pt
  const ink = glyph(config.menuBarDark)
  const size = TITLE_PT * pt

  ctx.save()
  // A faint scrim so titles stay legible over any screenshot behind them.
  ctx.fillStyle = config.menuBarDark ? '#ffffff' : '#000000'
  ctx.globalAlpha = 0.16
  ctx.fillRect(0, 0, width, barHeight)
  ctx.globalAlpha = 1

  ctx.fillStyle = ink
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'

  let x = width * 0.012
  drawApple(ctx, x + size * 0.42, barHeight / 2, size)
  x += size * 1.5

  MENUS.forEach((menu, index) => {
    ctx.globalAlpha = index === 0 ? 1 : 0.85
    ctx.font = `${index === 0 ? 700 : 400} ${size}px ${MENU_FONT}`
    ctx.fillText(menu, x, barHeight / 2)
    x += ctx.measureText(menu).width + size * 0.85
  })

  ctx.globalAlpha = 0.92
  ctx.textAlign = 'right'
  ctx.font = `400 ${size}px ${MENU_FONT}`
  ctx.fillText(config.time, width * 0.988, barHeight / 2)
  ctx.restore()
}

const MENU_FONT = '-apple-system, "SF Pro Text", "Segoe UI", system-ui, sans-serif'

/**
 * An apple silhouette, centred on (cx, cy) inside a box of `size`.
 *
 * One path, no compositing and no offscreen canvas: the body is a circle, and
 * the bite is a second circle subtracted from it by walking the long way round
 * the body and then back along the *inside* of the bite. The two intersection
 * angles below are solved once for the radii and offset used here — 0.44 rad on
 * the body, 1.91 rad on the bite — rather than recomputed every frame.
 *
 * At the size a menu bar actually renders this is a handful of pixels, so the
 * bite and the leaf are the whole job: they are what separate an apple from the
 * bullet point this used to draw.
 */
const BODY_CUT = 0.4404
const BITE_CUT = 1.9066
const BITE_OFFSET = 1.05
const BITE_RADIUS = 0.45

function drawApple(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
): void {
  const r = size * 0.3

  ctx.save()
  ctx.translate(cx, cy)
  // An apple is taller than it is round.
  ctx.scale(1, 1.12)

  ctx.beginPath()
  ctx.arc(0, 0, r, BODY_CUT, -BODY_CUT, false)
  ctx.arc(BITE_OFFSET * r, 0, BITE_RADIUS * r, -BITE_CUT, BITE_CUT, true)
  ctx.closePath()
  ctx.fill()

  // The leaf. It has to overlap the body slightly: the vertical scale above
  // lifts the crown to -1.12r, so a leaf placed at its nominal height floats
  // free of the fruit and reads as a separate speck.
  ctx.beginPath()
  ctx.ellipse(r * 0.32, -r * 1.02, r * 0.44, r * 0.2, -0.7, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}
