import { RecentUploads } from '@/features/media'
import { Panel } from '@/ui'
import { ControlList } from '@/ui/controls'
import { contentControls, hasVideo, playbackControls } from './screenContentControls'
import { OverlaysPanel } from './OverlaysPanel'
import { WindowPanel } from './WindowPanel'

/** The screenshot or recording shown on the device, and how it is placed. */
export function ScreenPanel() {
  return (
    <>
      <Panel title="Content">
        <ControlList controls={contentControls} />
        <RecentUploads />
      </Panel>
      <PlaybackPanel />
      <WindowPanel />
      <OverlaysPanel />
    </>
  )
}

/** Only meaningful for video, so every control inside is gated on it. */
function PlaybackPanel() {
  return (
    <Panel title="Playback">
      <ControlList
        controls={playbackControls.map((control) => ({
          ...control,
          visible: hasVideo,
        }))}
      />
    </Panel>
  )
}
