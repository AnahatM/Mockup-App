import type { OverlayKind } from '@/features/devices'
import { drawDock } from './dock'
import { drawMenuBar } from './menuBar'
import { drawGestureBar, drawNavBar } from './navigation'
import { drawStatusBar } from './statusBar'
import type { OverlayCanvas } from './context'
import { referenceFor } from './points'
import type { DeviceKind } from '@/features/devices'
import type { OverlaysConfig } from '../schema'

/**
 * Draws every enabled overlay the device supports into one transparent canvas.
 *
 * One composited layer rather than one plane per overlay: it is a single texture
 * and a single draw, and it is only redrawn when the config actually changes, so
 * a playing video costs nothing extra.
 */
export function composeOverlays(
  canvas: OverlayCanvas,
  supported: readonly OverlayKind[],
  config: OverlaysConfig,
  kind: DeviceKind,
): boolean {
  const { ctx, width, height } = canvas
  ctx.clearRect(0, 0, width, height)

  const drewPhone = composePhone(canvas, supported, config, kind)
  const drewDesktop = composeDesktop(canvas, supported, config, kind)
  return drewPhone || drewDesktop
}

function composePhone(
  canvas: OverlayCanvas,
  supported: readonly OverlayKind[],
  config: OverlaysConfig,
  kind: DeviceKind,
): boolean {
  const can = (kind: OverlayKind) => supported.includes(kind)

  /*
   * Android is the one that has to be asked for. Inferring it the other way —
   * "iOS if it supports the iOS status bar, otherwise Android" — reads fine
   * and is wrong for any device that supports one of the platform's other
   * overlays without that one, which then gets laid out against Android's
   * 412dp reference instead of iOS's 393pt. Caught by `overlays.test.ts`
   * within a minute of the reference model existing.
   */
  const platform =
    can('status-bar-android') || can('nav-bar-android') ? 'android' : 'ios'
  // Which screen the measurements are quoted against — a tablet's chrome is
  // genuinely different from a phone's, not merely scaled. See `points.ts`.
  const reference = referenceFor(kind, platform)
  let drew = false

  if (config.statusBar && (can('status-bar-ios') || can('status-bar-android'))) {
    drawStatusBar(canvas, config, platform, reference)
    drew = true
  }

  // Nav buttons and the gesture bar occupy the same space, so they are exclusive.
  if (config.navBar && can('nav-bar-android')) {
    drawNavBar(canvas, config, reference)
    drew = true
  } else if (config.gestureBar && can('gesture-bar')) {
    drawGestureBar(canvas, config, reference)
    drew = true
  }

  return drew
}

function composeDesktop(
  canvas: OverlayCanvas,
  supported: readonly OverlayKind[],
  config: OverlaysConfig,
  kind: DeviceKind,
): boolean {
  const reference = referenceFor(kind, 'ios')
  let drew = false
  if (config.menuBar && supported.includes('menu-bar')) {
    drawMenuBar(canvas, config, reference)
    drew = true
  }
  if (config.dock && supported.includes('dock')) {
    drawDock(canvas, config, reference)
    drew = true
  }
  return drew
}

/** Which overlay controls make sense for this device. */
export function overlayApplies(
  supported: readonly OverlayKind[],
  kinds: readonly OverlayKind[],
): boolean {
  return kinds.some((kind) => supported.includes(kind))
}
