import type { DeviceKind } from '@/features/devices'
import type { OverlayCanvas } from './context'

/**
 * The screens the on-screen chrome is measured against, in the platform's own
 * logical points.
 *
 * This is ADR 0008 applied to the overlays. The window chrome was converted
 * first and the reasoning is identical: a fraction is not a measurement. The
 * home indicator was `width * 0.36` and `height * 0.0042`, the Android back
 * button `width * 0.25` — numbers that read as deliberate and encode nothing,
 * so nobody could tell by looking at the code whether they were right, and
 * nothing could check them.
 *
 * A single reference is not enough, because the platforms genuinely differ by
 * device class rather than merely scaling: an iPhone's status bar is 54pt on a
 * 393pt-wide screen, and an iPad's is 24pt on a 1024pt one. Quoting both
 * against "the phone" and scaling would put a bar three times too deep on every
 * tablet. So the reference is chosen by what the device *is*, and each surface
 * converts once.
 */
export interface ReferenceScreen {
  /** Logical width, in points or density-independent pixels. */
  width: number
  height: number
}

/** iPhone 15 Pro. */
const PHONE: ReferenceScreen = { width: 393, height: 852 }

/** Pixel 8. Android's dp is the same idea under a different name. */
const ANDROID_PHONE: ReferenceScreen = { width: 412, height: 915 }

/** iPad Pro 13". */
const TABLET: ReferenceScreen = { width: 1024, height: 1366 }

/** MacBook Pro 14", which is also close enough for the monitor and all-in-one:
 *  macOS chrome is a fixed point size on every display it runs on. */
const DESKTOP: ReferenceScreen = { width: 1512, height: 982 }

export function referenceFor(kind: DeviceKind, platform: 'ios' | 'android'): ReferenceScreen {
  switch (kind) {
    case 'tablet':
      return TABLET
    case 'laptop':
    case 'desktop':
      return DESKTOP
    default:
      return platform === 'android' ? ANDROID_PHONE : PHONE
  }
}

/**
 * Pixels per point for this surface. Converted once; everything after it is a
 * literal read off the real interface.
 *
 * Width rather than height, because that is the axis the OS lays its chrome out
 * against — a status bar's height is fixed while the screen's is not, and a
 * mockup's canvas is the device's own aspect rather than the reference's.
 */
export const pointScale = (canvas: OverlayCanvas, reference: ReferenceScreen): number =>
  canvas.width / reference.width
