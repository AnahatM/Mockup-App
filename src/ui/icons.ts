/**
 * Inline icon geometry. Bundled as path data rather than fetched, because the app
 * makes no network requests at runtime (see CLAUDE.md).
 *
 * All icons are drawn on a 24x24 grid as strokes, so they inherit `currentColor`
 * and stay crisp at any size without a separate fill/outline variant.
 */
export const ICON_PATHS = {
  sun: [
    'M15.5 12a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0',
    'M12 3.5V5M12 19v1.5M3.5 12H5M19 12h1.5M6.1 6.1l1.1 1.1M16.8 16.8l1.1 1.1M17.9 6.1l-1.1 1.1M7.2 16.8l-1.1 1.1',
  ],
  moon: ['M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z'],
  monitor: ['M3.5 5.5h17v10h-17z', 'M9 19.5h6', 'M12 15.5v4'],
  chevronDown: ['m6 9.5 6 6 6-6'],
  chevronRight: ['m9.5 6 6 6-6 6'],
  chevronUp: ['m6 14.5 6-6 6 6'],
  close: ['m6 6 12 12M18 6 6 18'],
  plus: ['M12 5v14M5 12h14'],
  minus: ['M5 12h14'],
  check: ['m5 12.5 4.5 4.5L19 7.5'],
  upload: ['M12 16V4M8 8l4-4 4 4', 'M4 16v3.5h16V16'],
  download: ['M12 4v12M8 12l4 4 4-4', 'M4 20h16'],
  image: [
    'M3.5 4.5h17v15h-17z',
    'm4 16 5-5 4 4 3-3 4 4',
    'M15.5 8.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0',
  ],
  video: ['M3.5 6.5h11v11h-11z', 'm14.5 10 6-3.5v11l-6-3.5'],
  camera: [
    'M4 8h3l1.5-2h7L17 8h3v11H4z',
    'M15.5 13.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0',
  ],
  light: [
    'M9.5 18h5',
    'M10 21h4',
    'M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3Z',
  ],
  layers: ['m12 3 9 5-9 5-9-5 9-5Z', 'm3 13 9 5 9-5'],
  film: [
    'M3.5 5.5h17v13h-17z',
    'M8 5.5v13M16 5.5v13',
    'M3.5 9h4.5M3.5 15h4.5M16 9h4.5M16 15h4.5',
  ],
  play: ['M8 5.5v13l11-6.5z'],
  pause: ['M9 5.5v13M15 5.5v13'],
  sliders: ['M4 8h10M18 8h2M4 16h4M12 16h8', 'M16 6v4M9 14v4'],
  sparkle: [
    'm12 4 1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6z',
    'm18 15 .8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8z',
  ],
  droplet: ['M12 3.5s6 6.5 6 10.2A6 6 0 0 1 6 13.7C6 10 12 3.5 12 3.5Z'],
  grid: ['M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z'],
  save: ['M4.5 4.5h11l4 4v11h-15z', 'M8 4.5v5h7v-5', 'M8 19.5v-6h8v6'],
  folder: ['M3.5 6.5h6l2 2.5h9v10h-17z'],
  trash: ['M4.5 6.5h15', 'M9 6.5V4h6v2.5', 'm6.5 6.5 1 13.5h9l1-13.5'],
  copy: ['M9 9h11v11H9z', 'M15 9V4H4v11h5'],
  undo: ['M9 14 4 9l5-5', 'M4 9h9a6 6 0 0 1 0 12h-3'],
  redo: ['m15 14 5-5-5-5', 'M20 9h-9a6 6 0 0 0 0 12h3'],
  reset: ['M3.5 5v5h5', 'M4.6 10.5a8 8 0 1 1-.1 4'],
  eye: [
    'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z',
    'M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  ],
  eyeOff: [
    'm4 4 16 16',
    'M9.6 9.7A3 3 0 0 0 12 15c.9 0 1.8-.4 2.4-1.2',
    'M6.5 6.8C4 8.5 2.5 12 2.5 12S6 18.5 12 18.5c1.5 0 2.8-.4 4-1',
    'M17.7 15.2c2-1.7 3.8-3.2 3.8-3.2S18 5.5 12 5.5c-.7 0-1.4.1-2 .3',
  ],
  phone: ['M7 3.5h10v17H7z', 'M10.5 18h3'],
  tablet: ['M5.5 3.5h13v17h-13z', 'M11 18h2'],
  laptop: ['M6 6h12v9H6z', 'M3 18h18l-1.5-3H4.5z'],
  watch: ['M8 8.5h8v7H8z', 'M9.5 8.5 9 4.5h6l-.5 4M9.5 15.5l-.5 4h6l-.5-4'],
  window: [
    'M3.5 5.5h17v13h-17z',
    'M3.5 9.5h17',
    'M6.2 7.5h.01M8.7 7.5h.01M11.2 7.5h.01',
  ],
  dots: ['M6 12h.01M12 12h.01M18 12h.01'],
} as const

export type IconName = keyof typeof ICON_PATHS

export const ICON_NAMES = Object.keys(ICON_PATHS) as IconName[]
