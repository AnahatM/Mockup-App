import { describe, expect, it } from 'vitest'
import {
  canRedo,
  canUndo,
  current,
  emptyHistory,
  HISTORY_LIMIT,
  push,
  redo,
  undo,
} from './history'

const start = emptyHistory('a')

describe('history', () => {
  it('starts with the initial state and nothing to undo', () => {
    expect(current(start)).toBe('a')
    expect(canUndo(start)).toBe(false)
    expect(canRedo(start)).toBe(false)
  })

  it('records and steps back', () => {
    const after = push(push(start, 'b'), 'c')
    expect(current(after)).toBe('c')
    expect(current(undo(after))).toBe('b')
    expect(current(undo(undo(after)))).toBe('a')
  })

  it('will not step back past the beginning', () => {
    const stuck = undo(undo(undo(undo(start))))
    expect(current(stuck)).toBe('a')
    expect(canUndo(stuck)).toBe(false)
  })

  it('redoes what it undid', () => {
    const after = push(start, 'b')
    expect(current(redo(undo(after)))).toBe('b')
  })

  it('will not redo past the newest state', () => {
    const after = push(start, 'b')
    expect(current(redo(redo(after)))).toBe('b')
  })

  it('drops the redo branch once something new is recorded', () => {
    const branched = push(undo(push(start, 'b')), 'c')
    expect(canRedo(branched)).toBe(false)
    expect(current(branched)).toBe('c')
    // 'b' is gone: it is no longer reachable from here.
    expect(current(undo(branched))).toBe('a')
  })

  it('caps the stack, dropping the oldest entries', () => {
    let history = start
    for (let i = 0; i < HISTORY_LIMIT + 20; i += 1) history = push(history, `s${i}`)

    expect(history.past).toHaveLength(HISTORY_LIMIT)
    // The initial 'a' has been pushed out of the window.
    expect(history.past[0]).not.toBe('a')
    expect(current(history)).toBe(`s${HISTORY_LIMIT + 19}`)
  })

  it('never mutates the history it is given', () => {
    const after = push(start, 'b')
    expect(start.past).toEqual(['a'])
    expect(after).not.toBe(start)
  })

  it('survives a long undo/redo walk', () => {
    let history = push(push(push(start, 'b'), 'c'), 'd')
    history = undo(undo(history))
    expect(current(history)).toBe('b')
    history = redo(redo(history))
    expect(current(history)).toBe('d')
    expect(canRedo(history)).toBe(false)
  })

  it('works with object snapshots, keeping references intact', () => {
    const one = { value: 1 }
    const two = { value: 2 }
    const history = push(emptyHistory(one), two)
    expect(current(undo(history))).toBe(one)
  })
})
