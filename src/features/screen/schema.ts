import { z } from 'zod'

/**
 * Screen overlay configuration.
 *
 * Overlays are drawn into a transparent canvas composited in front of the
 * screen, never into geometry — which is what makes each one independently
 * toggleable and identical for procedural and imported devices.
 */
export const overlaysSchema = z.object({
  /* Phone status bar */
  statusBar: z.boolean().default(true),
  /** Dark glyphs, for light app content. */
  statusBarDark: z.boolean().default(false),
  time: z.string().max(12).default('9:41'),
  carrier: z.string().max(16).default(''),
  showSignal: z.boolean().default(true),
  showWifi: z.boolean().default(true),
  showBattery: z.boolean().default(true),
  batteryLevel: z.number().min(0).max(1).default(0.82),

  /* Phone navigation */
  gestureBar: z.boolean().default(true),
  gestureBarDark: z.boolean().default(false),
  navBar: z.boolean().default(false),

  /* Desktop */
  menuBar: z.boolean().default(true),
  menuBarDark: z.boolean().default(false),
  dock: z.boolean().default(true),
  dockIcons: z.number().int().min(3).max(12).default(8),
})

export type OverlaysConfig = z.infer<typeof overlaysSchema>

export const defaultOverlays = (): OverlaysConfig => overlaysSchema.parse({})
