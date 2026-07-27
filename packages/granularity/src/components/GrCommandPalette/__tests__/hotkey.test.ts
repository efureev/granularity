import { describe, expect, it } from 'vitest'

import {
  formatCommandHotkey,
  matchesCommandHotkey,
  parseCommandHotkey,
} from '../hotkey'

function keydown(init: KeyboardEventInit): KeyboardEvent {
  return new KeyboardEvent('keydown', init)
}

describe('parseCommandHotkey', () => {
  it('разбирает модификаторы и клавишу', () => {
    expect(parseCommandHotkey('mod+k')).toMatchObject({ key: 'k', mod: true, ctrl: false, meta: false })
    expect(parseCommandHotkey('Ctrl+Shift+P')).toMatchObject({ key: 'p', ctrl: true, shift: true })
    expect(parseCommandHotkey('Escape')).toMatchObject({ key: 'Escape', mod: false })
  })

  it('пустая строка не даёт сочетания', () => {
    expect(parseCommandHotkey('')).toBeNull()
    expect(parseCommandHotkey('+')).toBeNull()
  })
})

describe('matchesCommandHotkey', () => {
  const modK = parseCommandHotkey('mod+k')!

  it('на macOS `mod` — это Cmd', () => {
    expect(matchesCommandHotkey(keydown({ key: 'k', metaKey: true }), modK, true)).toBe(true)
    expect(matchesCommandHotkey(keydown({ key: 'k', ctrlKey: true }), modK, true)).toBe(false)
  })

  it('на остальных платформах `mod` — это Ctrl', () => {
    expect(matchesCommandHotkey(keydown({ key: 'k', ctrlKey: true }), modK, false)).toBe(true)
    expect(matchesCommandHotkey(keydown({ key: 'k', metaKey: true }), modK, false)).toBe(false)
  })

  it('лишние модификаторы ломают совпадение', () => {
    expect(matchesCommandHotkey(keydown({ key: 'k', metaKey: true, shiftKey: true }), modK, true)).toBe(false)
    expect(matchesCommandHotkey(keydown({ key: 'j', metaKey: true }), modK, true)).toBe(false)
  })

  it('регистр клавиши не важен', () => {
    expect(matchesCommandHotkey(keydown({ key: 'K', metaKey: true }), modK, true)).toBe(true)
  })
})

describe('formatCommandHotkey', () => {
  it('рисует платформенную подсказку', () => {
    const modK = parseCommandHotkey('mod+k')!
    expect(formatCommandHotkey(modK, true)).toEqual(['⌘', 'K'])
    expect(formatCommandHotkey(modK, false)).toEqual(['Ctrl', 'K'])
  })

  it('разворачивает все модификаторы', () => {
    const combo = parseCommandHotkey('ctrl+alt+shift+p')!
    expect(formatCommandHotkey(combo, false)).toEqual(['Ctrl', 'Alt', 'Shift', 'P'])
  })
})
