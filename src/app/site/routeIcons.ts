import type { IconName } from '@/ui'
import { ROUTES } from '../routes'

/**
 * Icon for each site route.
 *
 * Kept beside the navigation rather than in the route table: an icon is a
 * presentation choice made by the thing doing the presenting, and the route
 * table is consumed by the sitemap generator, which has no use for one.
 */
const ICONS: Record<string, IconName> = {
  [ROUTES.home]: 'home',
  [ROUTES.studio]: 'camera',
  [ROUTES.window]: 'window',
  [ROUTES.docs]: 'book',
  [ROUTES.about]: 'info',
  [ROUTES.privacy]: 'shield',
  [ROUTES.sitemap]: 'map',
}

export const iconForRoute = (path: string): IconName => ICONS[path] ?? 'chevronRight'
