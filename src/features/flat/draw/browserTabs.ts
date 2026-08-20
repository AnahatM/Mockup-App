import { mix } from '@/lib/color/hex'
import { roundRect, type BarGeometry } from './chrome'
import { plus, xmark } from './glyphs'
import { SYSTEM_FONT } from './macBar'
import type { RowContext } from './browserBar'
import type { FlatConfig } from '../schema'

/**
 * Safari's tab strip: the frontmost tab lifted out of the strip, the rest
 * flush and divided by short hairlines, and a new-tab button at the end.
 *
 * **Only the active tab gets real text.** The window carries one title, and a
 * mockup has no honest way to invent the other six — so the inactive tabs show
 * a favicon and a muted label bar, which is what a tab you are not reading
 * actually looks like at this size. Making up plausible page titles would put
 * words into someone's screenshot that they never wrote.
 *
 * Favicon colours are a fixed rotation rather than a hue derived from the
 * index, so the same mockup exports identically every time and the strip reads
 * as a row of distinct sites instead of a rainbow.
 */
const FAVICONS = ['#4a8cf7', '#e2564a', '#f0a538', '#3fb27f', '#8b5cf6', '#0ea5b7']

const TAB_INSET_PT = 4
const TAB_PAD_PT = 9
const FAVICON_PT = 16
const LABEL_PT = 12
const MAX_TAB_SHARE = 0.24

export function drawTabStrip(
  ctx: CanvasRenderingContext2D,
  bar: BarGeometry,
  config: FlatConfig,
  chrome: string,
  toolbarHeight: number,
  row: RowContext,
): void {
  const { pt, palette } = row
  const inset = TAB_INSET_PT * pt
  const stripHeight = bar.height - toolbarHeight
  const height = stripHeight - inset * 2
  const y = bar.y + toolbarHeight + inset
  if (height <= 0) return

  const newTab = height
  const available = bar.width - inset * 2 - newTab
  const width = Math.min(available / config.tabs, bar.width * MAX_TAB_SHARE)
  if (width < height) return

  for (let index = 0; index < config.tabs; index += 1) {
    const box = { x: bar.x + inset + index * width, y, width, height }
    if (box.x + width > bar.x + bar.width - inset) break
    drawTab(ctx, box, { config, chrome, row, active: index === 0 }, index)
  }

  ctx.save()
  ctx.strokeStyle = palette.ink
  ctx.globalAlpha = 0.5
  const cx = bar.x + inset + config.tabs * width + newTab / 2
  plus({ ctx, cx, cy: y + height / 2, size: FAVICON_PT * pt })
  ctx.restore()
}

interface TabStyle {
  config: FlatConfig
  chrome: string
  row: RowContext
  active: boolean
}

interface TabBox {
  x: number
  y: number
  width: number
  height: number
}

function drawTab(
  ctx: CanvasRenderingContext2D,
  box: TabBox,
  style: TabStyle,
  index: number,
): void {
  const { chrome, row, active } = style
  const pad = TAB_PAD_PT * row.pt

  if (active) {
    roundRect(ctx, box.x, box.y, box.width, box.height, box.height * 0.24)
    ctx.fillStyle = chrome
    ctx.fill()
  } else if (index > 0) {
    // Inactive tabs are not boxes at all in Safari — they are divided from
    // their neighbour by a short hairline that stops well short of both edges.
    ctx.fillStyle = mix(row.palette.strip, row.palette.ink, 0.18)
    ctx.fillRect(box.x, box.y + box.height * 0.28, 1, box.height * 0.44)
  }

  const icon = FAVICON_PT * row.pt
  const iconX = box.x + pad
  roundRect(ctx, iconX, box.y + (box.height - icon) / 2, icon, icon, icon * 0.26)
  ctx.fillStyle = FAVICONS[index % FAVICONS.length] ?? '#4a8cf7'
  ctx.globalAlpha = active ? 1 : 0.7
  ctx.fill()
  ctx.globalAlpha = 1

  drawLabel(ctx, box, style, iconX + icon + pad * 0.7)
}

function drawLabel(
  ctx: CanvasRenderingContext2D,
  box: TabBox,
  { config, row, active }: TabStyle,
  x: number,
): void {
  const midY = box.y + box.height / 2
  const pad = TAB_PAD_PT * row.pt
  const close = active ? FAVICON_PT * row.pt : 0
  const room = box.x + box.width - pad - close - x
  if (room <= 0) return

  ctx.save()
  ctx.fillStyle = row.palette.ink
  ctx.strokeStyle = row.palette.ink

  if (active && config.title) {
    ctx.font = `500 ${LABEL_PT * row.pt}px ${SYSTEM_FONT}`
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'
    ctx.globalAlpha = 0.85
    ctx.fillText(config.title, x, midY, room)
    ctx.globalAlpha = 0.45
    xmark({ ctx, cx: box.x + box.width - pad - close / 2, cy: midY, size: close })
  } else {
    ctx.globalAlpha = 0.26
    const thickness = LABEL_PT * row.pt * 0.42
    roundRect(ctx, x, midY - thickness / 2, room * 0.62, thickness, thickness / 2)
    ctx.fill()
  }

  ctx.restore()
}
