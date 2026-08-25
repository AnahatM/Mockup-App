// @vitest-environment jsdom
import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * The window tool renders the studio's own control schemas outside the studio.
 *
 * Those schemas read state through an injected `ControlBinding`, and in the
 * studio the provider is `AppShell` — which this page does not have. Shipping
 * it without its own provider took the whole `/window` route down with
 * "Controls must be rendered inside <ControlBindingProvider>", and nothing in
 * the suite noticed, because every other test here is of a pure function.
 *
 * So this mounts the real thing: real store, real control schemas, real rows.
 * If the binding ever goes missing again, `ControlRow` throws and this fails.
 */

// jsdom implements neither, and `FlatPreview` measures itself with one.
vi.stubGlobal(
  'ResizeObserver',
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
)
vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
  cb(0)
  return 0
})
vi.stubGlobal('cancelAnimationFrame', () => {})

const { FlatStudio } = await import('./FlatStudio')
const { useAppStore } = await import('@/state/store')

afterEach(() => {
  vi.restoreAllMocks()
})

describe('FlatStudio', () => {
  it('renders its controls without a surrounding AppShell', () => {
    render(<FlatStudio />)

    expect(screen.getByText('Window mockup')).toBeTruthy()
    expect(screen.getByRole('button', { name: /export window png/i })).toBeTruthy()
  })

  it('resolves each schema state through the binding it supplies', () => {
    // `Frame` (content) and `Container style` (container) are unconditional;
    // `Dark window` (style) is hidden while the frame is 'none', which is the
    // default. A control that could not read state would get neither right.
    render(<FlatStudio />)

    expect(screen.getByText('Frame')).toBeTruthy()
    expect(screen.getByText('Container style')).toBeTruthy()
    expect(screen.queryByText('Dark window')).toBeNull()

    act(() => {
      useAppStore.setState((draft) => {
        draft.flat.style = 'macos'
      })
    })

    expect(screen.getByText('Dark window')).toBeTruthy()
  })
})

describe('the window tool with nothing loaded', () => {
  // The store is a module singleton shared across this file, and the test
  // above deliberately switches the chrome on. Without this, "nothing loaded"
  // would be testing whatever the previous test left behind.
  beforeEach(() => {
    act(() => {
      useAppStore.setState((draft) => {
        draft.flat.style = 'none'
      })
    })
  })

  it('explains the empty preview instead of showing a blank rectangle', () => {
    /*
     * The tool opens with no screenshot and `style: 'none'`, so the compositor
     * has nothing to draw and the preview is a large empty box — a correctly
     * working preview that is indistinguishable from a broken one, and the
     * first thing anyone saw on this route.
     */
    render(<FlatStudio />)
    expect(screen.getByText('Nothing to preview yet')).toBeDefined()
  })

  it('draws the preview once there is chrome to show, with no upload', () => {
    // An empty window frame is a real preview of a real setting.
    act(() => {
      useAppStore.setState((draft) => {
        draft.flat.style = 'macos'
      })
    })
    render(<FlatStudio />)
    expect(screen.queryByText('Nothing to preview yet')).toBeNull()
    expect(screen.getByLabelText('Live preview of the window mockup')).toBeDefined()
  })
})
