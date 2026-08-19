import devices from '../articles/devices.md?raw'
import screenContent from '../articles/screen-content.md?raw'
import overlays from '../articles/overlays.md?raw'
import windowMockups from '../articles/window-mockups.md?raw'
import type { DocArticle } from '../types'

export const MOCKUPS_ARTICLES: readonly DocArticle[] = [
  {
    slug: 'devices',
    section: 'mockups',
    title: 'Devices',
    summary: 'The catalogue, and how to change a device’s colour, materials and details.',
    keywords: ['phone', 'laptop', 'tablet', 'watch', 'monitor', 'colour', 'color'],
    related: ['materials', 'importing-models'],
    order: 1,
    body: devices,
  },
  {
    slug: 'screen-content',
    section: 'mockups',
    title: 'Screen content',
    summary: 'Putting a screenshot or a video on the screen, and matching your brand colours.',
    keywords: ['screenshot', 'upload', 'video', 'fit', 'crop', 'zoom', 'palette'],
    related: ['overlays', 'window-mockups'],
    order: 2,
    body: screenContent,
  },
  {
    slug: 'overlays',
    section: 'mockups',
    title: 'Screen overlays',
    summary: 'Status bar, gesture bar, menu bar and dock, each independently switchable.',
    keywords: ['status bar', 'notch', 'battery', 'wifi', 'dock', 'menu bar', 'gesture'],
    related: ['screen-content', 'devices'],
    order: 3,
    body: overlays,
  },
  {
    slug: 'window-mockups',
    section: 'mockups',
    title: 'Window mockups',
    summary: 'macOS and browser chrome, on a device screen or exported flat.',
    keywords: ['browser', 'macos', 'traffic lights', 'title bar', 'safari', 'chrome', '2d'],
    related: ['screen-content', 'exporting-images'],
    order: 4,
    body: windowMockups,
  },
]
