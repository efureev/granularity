import { describe, expect, it } from 'vitest'

import {
  formatCommandHotkey,
  formatHotkeyToken,
  matchesCommandHotkey,
  parseCommandHotkey,
  splitHotkeyCombo,
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

  it('нелатинская раскладка: комбинация матчится по физическому коду', () => {
    expect(matchesCommandHotkey(keydown({ key: 'л', code: 'KeyK', ctrlKey: true }), modK, false)).toBe(true)
    expect(matchesCommandHotkey(keydown({ key: 'л', code: 'KeyJ', ctrlKey: true }), modK, false)).toBe(false)
  })

  it('событие во время IME-композиции не матчится', () => {
    expect(matchesCommandHotkey(keydown({ key: 'k', metaKey: true, isComposing: true }), modK, true)).toBe(false)
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

describe('formatHotkeyToken', () => {
  it('mod зависит от платформы', () => {
    expect(formatHotkeyToken('mod', true)).toEqual({ label: '⌘', name: 'command' })
    expect(formatHotkeyToken('mod', false)).toEqual({ label: 'Ctrl' })
  })

  // Имя нужно символу: `⌘` диктор читает как знак, а `Ctrl` — как слово.
  it('читаемое имя добавляется только символам', () => {
    expect(formatHotkeyToken('shift', true)).toEqual({ label: '⇧', name: 'shift' })
    expect(formatHotkeyToken('shift', false)).toEqual({ label: 'Shift' })
    expect(formatHotkeyToken('ctrl', false).name).toBeUndefined()
  })

  it('одиночная буква приводится к заглавной', () => {
    expect(formatHotkeyToken('k', false)).toEqual({ label: 'K' })
    expect(formatHotkeyToken('Esc', false)).toEqual({ label: 'Esc', name: 'escape' })
  })

  it('незнакомый токен отдаётся как есть', () => {
    expect(formatHotkeyToken('F5', false)).toEqual({ label: 'F5' })
  })
})

describe('splitHotkeyCombo', () => {
  it('режет комбинацию и чистит пробелы', () => {
    expect(splitHotkeyCombo(' mod + shift + K ')).toEqual(['mod', 'shift', 'K'])
  })
})
