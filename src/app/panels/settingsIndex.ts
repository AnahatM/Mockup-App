import type { Control } from '@/ui/controls'
import type { InspectorTab } from '@/state/slices/ui'
import type { AppState } from '@/state/types'
import { animationControls } from './motionControls'
import { framingControls } from './cameraFramingControls'
import { navigationControls } from './cameraNavigationControls'
import { finishControls, materialControls } from './deviceFinishControls'
import { detailControls, placementControls } from './devicePlacementControls'
import { imageControls, videoControls } from './exportControls'
import { rigControls } from './lightingRigControls'
import { navigationControls as overlayNavControls } from './navigationControls'
import { renderControls } from './renderControls'
import { roomControls } from './roomControls'
import { backdropControls, pedestalControls } from './sceneBackdropControls'
import { contentControls, playbackControls } from './screenContentControls'
import { shadowControls } from './shadowControls'
import { statusBarControls } from './statusBarControls'
import { windowContentControls } from './windowControls'
import { windowStyleControls } from './windowStyleControls'

/**
 * Every control in the app, tagged with where it lives.
 *
 * This exists so settings are searchable. Because controls are already declared
 * as data, indexing them is a matter of listing the arrays rather than
 * maintaining a parallel list of setting names that would immediately drift out
 * of date.
 */
export interface SettingGroup {
  tab: InspectorTab
  /** The panel heading the control sits under. */
  panel: string
  controls: readonly Control<AppState>[]
}

export const SETTING_GROUPS: readonly SettingGroup[] = [
  { tab: 'device', panel: 'Finish', controls: finishControls },
  { tab: 'device', panel: 'Materials', controls: materialControls },
  { tab: 'device', panel: 'Details', controls: detailControls },
  { tab: 'device', panel: 'Placement', controls: placementControls },

  { tab: 'screen', panel: 'Content', controls: contentControls },
  { tab: 'screen', panel: 'Playback', controls: playbackControls },
  { tab: 'screen', panel: 'Window mockup', controls: windowContentControls },
  { tab: 'screen', panel: 'Window mockup', controls: windowStyleControls },
  { tab: 'screen', panel: 'Status bar', controls: statusBarControls },
  { tab: 'screen', panel: 'Navigation', controls: overlayNavControls },

  { tab: 'scene', panel: 'Backdrop', controls: backdropControls },
  { tab: 'scene', panel: 'Pedestal', controls: pedestalControls },
  { tab: 'scene', panel: 'Shadow', controls: shadowControls },
  { tab: 'scene', panel: 'Render', controls: renderControls },

  { tab: 'camera', panel: 'Framing', controls: framingControls },
  { tab: 'camera', panel: 'Navigation', controls: navigationControls },

  { tab: 'lighting', panel: 'Rig', controls: rigControls },
  { tab: 'lighting', panel: 'Room', controls: roomControls },

  { tab: 'animation', panel: 'Motion', controls: animationControls },

  { tab: 'export', panel: 'Image', controls: imageControls },
  { tab: 'export', panel: 'Video', controls: videoControls },
]

export interface SettingEntry {
  tab: InspectorTab
  panel: string
  label: string
  hint?: string
}

/**
 * Flattens every control into a searchable row.
 *
 * Groups are walked recursively, and the bare `custom` escape hatches are
 * skipped — they have a label but no setting behind it, so offering one as a
 * search result would take the user to a panel and leave them hunting.
 */
export function settingEntries(): SettingEntry[] {
  const rows: SettingEntry[] = []

  const walk = (group: SettingGroup, controls: readonly Control<AppState>[]) => {
    for (const control of controls) {
      if (control.kind === 'group') {
        walk(group, control.children)
        continue
      }
      if (control.kind === 'custom' && control.bare) continue

      rows.push({
        tab: group.tab,
        panel: group.panel,
        label: control.label,
        ...(control.hint ? { hint: control.hint } : {}),
      })
    }
  }

  for (const group of SETTING_GROUPS) walk(group, group.controls)
  return rows
}
