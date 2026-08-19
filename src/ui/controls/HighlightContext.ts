import { createContext, useContext } from 'react'

/**
 * The label of a control to visually flag, or null.
 *
 * A context rather than a prop because the flag is set by search — somewhere far
 * outside the panel — and threading it through every ControlList and group would
 * touch every panel in the app to serve one transient effect.
 */
export const HighlightContext = createContext<string | null>(null)

export const useHighlight = (): string | null => useContext(HighlightContext)
