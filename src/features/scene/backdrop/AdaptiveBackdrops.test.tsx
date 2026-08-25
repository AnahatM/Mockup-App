// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { mediaPalette, type MediaSource } from '@/features/media/schema'
import { AdaptiveBackdrops } from './AdaptiveBackdrops'

/**
 * The whole Scene tab was unreachable, in every fresh session, on main.
 *
 * `mediaPalette` returned a new `[]` whenever no screenshot had been uploaded,
 * and this component handed it straight to a Zustand selector. A selector's
 * result is compared by identity on every store read, so a fresh array each
 * time never settles: React re-rendered until it hit its nested-update limit,
 * threw "Maximum update depth exceeded", and the studio's error boundary
 * replaced the entire panel — and the canvas with it.
 *
 * Nothing caught it because every other test of this feature is of a pure
 * function, and `deriveBackdrops` was never the broken part.
 */
describe('adaptive backdrops with nothing uploaded', () => {
  it('renders its empty state instead of looping forever', () => {
    // No media is the default, and the default is the case that crashed.
    render(<AdaptiveBackdrops />)
    expect(screen.getByText('No colours to match yet')).toBeDefined()
  })

  it('gives the same empty palette back every time it is asked', () => {
    /*
     * The identity, not the contents, is the whole point — `toEqual` would
     * pass on two different empty arrays and prove nothing. Verified by
     * changing `NO_PALETTE` back to a literal `[]`, which fails this and the
     * test above together.
     */
    const source: MediaSource = { kind: 'none' }
    expect(mediaPalette(source)).toBe(mediaPalette(source))
  })
})
