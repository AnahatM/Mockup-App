/**
 * The pure half of the media feature: schema, recents and brand targets.
 *
 * See `features/devices/state.ts`. The media barrel exports components, and a
 * component in this app reads the store — so a store slice importing the barrel
 * closes a cycle and drags whatever those components reach in behind it.
 *
 * That was not academic. The barrel used to export `useScreenTexture`, which
 * imports three.js to build the screen texture, and a store slice importing the
 * barrel therefore put the 3D engine into every page in the app, the landing
 * page and the documentation included. It has since moved to
 * `features/screen`, next to the other three.js texture hooks, because it was
 * still reaching the 2D window tool through this barrel long after the store
 * stopped doing so — see ADR 0006.
 */
export { BRAND_TARGETS, findBrandTarget, type BrandTarget } from './brandTargets'
export {
  RECENTS_CAP,
  moveToFront,
  recentIdFor,
  upsertRecent,
  type RecentUpload,
} from './recents'
export {
  defaultScreen,
  mediaAspect,
  mediaPalette,
  screenSchema,
  type MediaSource,
  type ScreenConfig,
} from './schema'
