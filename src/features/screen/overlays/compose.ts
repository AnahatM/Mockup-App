import type { OverlayKind } from '@/features/devices'
import { drawDock } from './dock'
import { drawMenuBar } from './menuBar'
import { drawGestureBar, drawNavBar } from './navigation'
import { drawStatusBar } from './statusBar'
import type { OverlayCanvas } from './context'
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
): boolean {
  const { ctx, width, height } = canvas
  ctx.clearRect(0, 0, width, height)

  const drewPhone = composePhone(canvas, supported, config)
  const drewDesktop = composeDesktop(canvas, supported, config)
  return drewPhone || drewDesktop
}

function composePhone(
  canvas: OverlayCanvas,
  supported: readonly OverlayKind[],
  config: OverlaysConfig,
): boolean {
  const can = (kind: OverlayKind) => supported.includes(kind)
  let drew = false

  if (config.statusBar && (can('status-bar-ios') || can('status-bar-android'))) {
    drawStatusBar(canvas, config, can('status-bar-ios') ? 'ios' : 'android')
    drew = true
  }

  // Nav buttons and the gesture bar occupy the same space, so they are exclusive.
  if (config.navBar && can('nav-bar-android')) {
    drawNavBar(canvas, config)
    drew = true
  } else if (config.gestureBar && can('gesture-bar')) {
    drawGestureBar(canvas, config)
    drew = true
  }

  return drew
}

function composeDesktop(
  canvas: OverlayCanvas,
  supported: readonly OverlayKind[],
  config: OverlaysConfig,
): boolean {
  let drew = false
  if (config.menuBar && supported.includes('menu-bar')) {
    drawMenuBar(canvas, config)
    drew = true
  }
  if (config.dock && supported.includes('dock')) {
    drawDock(canvas, config)
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
