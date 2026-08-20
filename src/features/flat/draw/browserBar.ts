import { mix } from '@/lib/color/hex'
import { readableOn } from '@/lib/color/contrast'
import {
  LIGHT_DIAMETER_PT,
  LIGHT_INSET_PT,
  LIGHT_PITCH_PT,
  TOOLBAR_PT,
  drawTrafficLights,
  roundRect,
  topRoundedRect,
  type BarGeometry,
} from './chrome'
import { chevron, lock, panes, reload, share } from './glyphs'
import { SYSTEM_FONT } from './macBar'
import { drawTabStrip } from './browserTabs'
import type { FlatConfig } from '../schema'

/**
 * Browser chrome, laid out the way Safari on macOS lays it out: the toolbar on
 * top carrying the window controls, and the tab strip *below* it.
 *
 * This used to be tabs-on-top with a grey bar standing in for every control,
 * which read as "a browser, roughly" rather than as a browser. The controls are
 * now the actual ones — sidebar, back, forward, a padlocked address field with
 * reload inside it, share and tab overview — drawn from `glyphs.ts` and
 * measured in points off a 52pt Safari toolbar.
 *
 * Safari hides the tab bar entirely when there is only one tab, so a `tabs` of
 * zero gives the toolbar the whole bar rather than leaving a blank strip.
 */

/** 52pt of toolbar over 36pt of tab bar is the split Safari actually uses. */
const TOOLBAR_SHARE = 52 / 88

const GLYPH_PT = 17
const GLYPH_PITCH_PT = 30
const FIELD_HEIGHT_PT = 28
const FIELD_TEXT_PT = 13

export interface BarPalette {
  /** Foreground for glyphs and text, chosen for contrast against the chrome. */
  ink: string
  /** The tab strip behind the tabs. */
  strip: string
  /** The address field. */
  field: string
}

/** A row's geometry and its own points-to-pixels scale. */
export interface RowContext {
  /** Pixels per macOS point for this row. */
  pt: number
  palette: BarPalette
}

export function drawBrowserBar(
  ctx: CanvasRenderingContext2D,
  bar: BarGeometry,
  config: FlatConfig,
  chrome: string,
): void {
  const palette = resolvePalette(config, chrome)
  const toolbarHeight = config.tabs > 0 ? bar.height * TOOLBAR_SHARE : bar.height
  const pt = toolbarHeight / TOOLBAR_PT

  paintSurfaces(ctx, bar, config, chrome, toolbarHeight, palette)
  drawToolbar(ctx, bar, config, toolbarHeight, { pt, palette })

  if (config.tabs > 0) {
    drawTabStrip(ctx, bar, config, chrome, toolbarHeight, { pt, palette })
  }
}

function resolvePalette(config: FlatConfig, chrome: string): BarPalette {
  return {
    ink: readableOn(chrome, '#f4f3ee', '#1a1a18'),
    strip: mix(chrome, '#000000', config.dark ? 0.3 : 0.12),
    // On a dark window the address field is lifted out of the toolbar; on a
    // light one it is recessed into it. Both directions read as "inset".
    field: config.dark ? mix(chrome, '#ffffff', 0.1) : mix(chrome, '#000000', 0.07),
  }
}

function paintSurfaces(
  ctx: CanvasRenderingContext2D,
  bar: BarGeometry,
  config: FlatConfig,
  chrome: string,
  toolbarHeight: number,
  palette: BarPalette,
): void {
  topRoundedRect(ctx, bar.x, bar.y, bar.width, bar.height, bar.radius)
  ctx.save()
  ctx.clip()

  const ramp = ctx.createLinearGradient(0, bar.y, 0, bar.y + toolbarHeight)
  ramp.addColorStop(0, mix(chrome, '#ffffff', config.dark ? 0.05 : 0.06))
  ramp.addColorStop(1, mix(chrome, '#000000', 0.02))
  ctx.fillStyle = ramp
  ctx.fillRect(bar.x, bar.y, bar.width, toolbarHeight)

  if (config.tabs > 0) {
    ctx.fillStyle = palette.strip
    ctx.fillRect(bar.x, bar.y + toolbarHeight, bar.width, bar.height - toolbarHeight)
  }
  ctx.restore()

  ctx.fillStyle = mix(chrome, '#000000', config.dark ? 0.4 : 0.14)
  ctx.fillRect(bar.x, bar.y + bar.height - 1, bar.width, 1)
}

/* One toolbar row, laid out left to right in a single pass — splitting it
   would mean threading the running cursor and half a dozen metrics through
   three more signatures to save nothing. */
function drawToolbar(
  ctx: CanvasRenderingContext2D,
  bar: BarGeometry,
  config: FlatConfig,
  height: number,
  { pt, palette }: RowContext,
): void {
  const midY = bar.y + height / 2
  const size = GLYPH_PT * pt
  const pitch = GLYPH_PITCH_PT * pt
  let x = bar.x + LIGHT_INSET_PT * pt

  ctx.save()
  ctx.strokeStyle = palette.ink
  ctx.fillStyle = palette.ink

  if (config.trafficLights) {
    const radius = (LIGHT_DIAMETER_PT * pt) / 2
    const gap = LIGHT_PITCH_PT * pt
    x += drawTrafficLights(ctx, x, midY, radius, config.trafficLightsMuted, gap)
    x += pitch
  }

  ctx.globalAlpha = 0.62
  for (const draw of [
    () => panes({ ctx, cx: x, cy: midY, size }, 'sidebar'),
    () => chevron({ ctx, cx: x, cy: midY, size }, 1),
    () => chevron({ ctx, cx: x, cy: midY, size }, -1),
  ]) {
    draw()
    x += pitch
  }

  const rightEdge = bar.x + bar.width - LIGHT_INSET_PT * pt
  panes({ ctx, cx: rightEdge - size / 2, cy: midY, size }, 'tabs')
  share({ ctx, cx: rightEdge - size / 2 - pitch, cy: midY, size })
  ctx.restore()

  drawAddressField(ctx, bar, config, { midY, pt, palette, left: x })
}

interface FieldContext {
  midY: number
  pt: number
  palette: BarPalette
  /** Where the left-hand controls ended; the field never overlaps them. */
  left: number
}

function drawAddressField(
  ctx: CanvasRenderingContext2D,
  bar: BarGeometry,
  config: FlatConfig,
  { midY, pt, palette, left }: FieldContext,
): void {
  const height = FIELD_HEIGHT_PT * pt
  const width = Math.min(bar.width * 0.44, (bar.x + bar.width / 2 - left) * 1.9)
  if (width <= height) return

  const x = bar.x + (bar.width - width) / 2
  roundRect(ctx, x, midY - height / 2, width, height, height * 0.26)
  ctx.fillStyle = palette.field
  ctx.fill()

  ctx.save()
  ctx.fillStyle = palette.ink
  ctx.strokeStyle = palette.ink
  ctx.globalAlpha = 0.5
  const glyph = height * 0.56
  reload({ ctx, cx: x + width - height * 0.6, cy: midY, size: glyph })

  if (config.url) {
    // Lock and text travel together, centred as a pair — an address that is
    // centred on its own leaves the padlock stranded off to one side.
    ctx.font = `500 ${FIELD_TEXT_PT * pt}px ${SYSTEM_FONT}`
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'
    const gap = glyph * 0.3
    const start = x + (width - (glyph + gap + ctx.measureText(config.url).width)) / 2

    ctx.globalAlpha = 0.7
    lock({ ctx, cx: start + glyph / 2, cy: midY, size: glyph })
    ctx.globalAlpha = 0.85
    ctx.fillText(config.url, start + glyph + gap, midY)
  }
  ctx.restore()
}
