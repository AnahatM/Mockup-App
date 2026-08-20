import { mix } from '@/lib/color/hex'
import { readableOn } from '@/lib/color/contrast'
import {
  LIGHT_DIAMETER_PT,
  LIGHT_INSET_PT,
  LIGHT_PITCH_PT,
  TITLE_BAR_PT,
  drawTrafficLights,
  topRoundedRect,
  type BarGeometry,
} from './chrome'
import type { FlatConfig } from '../schema'

/**
 * A macOS title bar: window controls on the left, title centred or beside them.
 *
 * Everything here is a reading off the real thing, in points, converted once —
 * a 28pt bar carrying 12pt buttons and a 13pt semibold title. See `chrome.ts`
 * for why the units are points rather than fractions.
 *
 * Every colour is derived from `chrome` rather than hardcoded, because the bar
 * is user-colourable and can be matched to an arbitrary screenshot. What is
 * fixed is the *relationship* between them — the bar is fractionally lighter at
 * the top than the bottom, which is what stops a large flat rectangle reading
 * as a solid block of paint.
 */
const TITLE_PT = 13
const TITLE_GAP_PT = 14

export function drawMacBar(
  ctx: CanvasRenderingContext2D,
  bar: BarGeometry,
  config: FlatConfig,
  chrome: string,
): void {
  const pt = bar.height / TITLE_BAR_PT
  paintBar(ctx, bar, config, chrome)

  const midY = bar.y + bar.height / 2
  let left = bar.x + LIGHT_INSET_PT * pt

  if (config.trafficLights) {
    const radius = (LIGHT_DIAMETER_PT * pt) / 2
    const pitch = LIGHT_PITCH_PT * pt
    left += drawTrafficLights(ctx, left, midY, radius, config.trafficLightsMuted, pitch)
    left += TITLE_GAP_PT * pt
  }

  drawTitle(ctx, bar, config, chrome, { left, midY, pt })
}

/** The bar's own surface: a shallow vertical ramp, capped by a hairline. */
function paintBar(
  ctx: CanvasRenderingContext2D,
  bar: BarGeometry,
  config: FlatConfig,
  chrome: string,
): void {
  const ramp = ctx.createLinearGradient(0, bar.y, 0, bar.y + bar.height)
  ramp.addColorStop(0, mix(chrome, '#ffffff', config.dark ? 0.05 : 0.06))
  ramp.addColorStop(1, mix(chrome, '#000000', 0.02))

  topRoundedRect(ctx, bar.x, bar.y, bar.width, bar.height, bar.radius)
  ctx.fillStyle = ramp
  ctx.fill()

  // The separator is much stronger on a dark window than a light one, which is
  // how macOS keeps it visible against near-black chrome without it turning
  // into a hard black line on a pale one.
  ctx.fillStyle = mix(chrome, '#000000', config.dark ? 0.35 : 0.12)
  ctx.fillRect(bar.x, bar.y + bar.height - 1, bar.width, 1)
}

interface TitleContext {
  /** Where the window controls ended, for a left-aligned title. */
  left: number
  midY: number
  pt: number
}

function drawTitle(
  ctx: CanvasRenderingContext2D,
  bar: BarGeometry,
  config: FlatConfig,
  chrome: string,
  { left, midY, pt }: TitleContext,
): void {
  if (!config.title) return

  ctx.save()
  ctx.font = `600 ${TITLE_PT * pt}px ${SYSTEM_FONT}`
  ctx.textBaseline = 'middle'
  // Pick the readable foreground rather than assuming, since the bar can be
  // colour-matched to an arbitrary screenshot. macOS renders the title in a
  // grey rather than full-strength ink, so it recedes behind the content.
  ctx.fillStyle = readableOn(chrome, '#f4f3ee', '#1a1a18')
  ctx.globalAlpha = 0.78

  if (config.titleAlign === 'center') {
    ctx.textAlign = 'center'
    ctx.fillText(config.title, bar.x + bar.width / 2, midY)
  } else {
    ctx.textAlign = 'left'
    ctx.fillText(config.title, left, midY)
  }
  ctx.restore()
}

/**
 * The host's own UI font, in the order the platforms that have one expose it.
 * On macOS this resolves to SF Pro, which is what a macOS window would be
 * drawing the title in anyway.
 */
export const SYSTEM_FONT =
  '-apple-system, "SF Pro Text", "Segoe UI Variable", "Segoe UI", system-ui, sans-serif'
