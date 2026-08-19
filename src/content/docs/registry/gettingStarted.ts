import quickStart from '../articles/quick-start.md?raw'
import interfaceTour from '../articles/interface.md?raw'
import shortcuts from '../articles/shortcuts.md?raw'
import type { DocArticle } from '../types'

export const GETTING_STARTED_ARTICLES: readonly DocArticle[] = [
  {
    slug: 'quick-start',
    section: 'getting-started',
    title: 'Quick start',
    summary: 'From nothing to an exported mockup in about a minute.',
    keywords: ['start', 'begin', 'first', 'tutorial', 'how do i', 'new'],
    related: ['interface', 'devices', 'exporting-images'],
    order: 1,
    body: quickStart,
  },
  {
    slug: 'interface',
    section: 'getting-started',
    title: 'Interface tour',
    summary: 'The device rail, the viewport and the inspector, and what lives where.',
    keywords: ['layout', 'panels', 'tabs', 'inspector', 'sidebar', 'ui'],
    related: ['shortcuts', 'quick-start'],
    order: 2,
    body: interfaceTour,
  },
  {
    slug: 'shortcuts',
    section: 'getting-started',
    title: 'Keyboard shortcuts',
    summary: 'Every key the studio responds to.',
    keywords: ['keys', 'hotkeys', 'keybindings', 'navigation', 'wasd'],
    related: ['interface', 'camera'],
    order: 3,
    body: shortcuts,
  },
]
