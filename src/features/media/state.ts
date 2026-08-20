/**
 * The pure half of the media feature: schema, recents and brand targets.
 *
 * See `features/devices/state.ts`. The media barrel exports `useScreenTexture`,
 * which imports three.js to build the screen texture — so a store slice
 * importing the barrel put the 3D engine into every page in the app, including
 * the landing page and the documentation.
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
