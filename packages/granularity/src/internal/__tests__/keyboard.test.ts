import { describe, expect, it } from 'vitest'

import { codeForChar, eventMatchesKey, isComposingEvent, parseHotkeyCombo, parseHotkeySequence, shiftSatisfied } from '../keyboard'

function keyEvent(init: KeyboardEventInit & { keyCode?: number } = {}): KeyboardEvent {
  const { keyCode, ...rest } = init
  const event = new KeyboardEvent('keydown', rest)
  if (keyCode !== undefined)
    Object.defineProperty(event, 'keyCode', { value: keyCode })
  return event
}

describe('isComposingEvent', () => {
  it('true при isComposing и при keyCode 229', () => {
    expect(isComposingEvent(keyEvent({ key: 'Enter', isComposing: true }))).toBe(true)
    expect(isComposingEvent(keyEvent({ key: 'Enter', keyCode: 229 }))).toBe(true)
    expect(isComposingEvent(keyEvent({ key: 'Enter' }))).toBe(false)
  })
})

describe('codeForChar', () => {
  it('буквы и цифры → физический код, остальное → null', () => {
    expect(codeForChar('k')).toBe('KeyK')
    expect(codeForChar('K')).toBe('KeyK')
    expect(codeForChar('5')).toBe('Digit5')
    expect(codeForChar('?')).toBeNull()
    expect(codeForChar('л')).toBeNull()
  })
})

describe('eventMatchesKey', () => {
  it('одиночный символ матчится по key без учёта регистра', () => {
    expect(eventMatchesKey(keyEvent({ key: 'K' }), 'k')).toBe(true)
    expect(eventMatchesKey(keyEvent({ key: 'j' }), 'k')).toBe(false)
  })

  it('кириллическая раскладка: совпадение по code только с codeFallback', () => {
    const cyrillic = keyEvent({ key: 'л', code: 'KeyK' })
    expect(eventMatchesKey(cyrillic, 'k')).toBe(false)
    expect(eventMatchesKey(cyrillic, 'k', { codeFallback: true })).toBe(true)
  })

  it('именованные клавиши — точное совпадение', () => {
    expect(eventMatchesKey(keyEvent({ key: 'Escape' }), 'Escape')).toBe(true)
    expect(eventMatchesKey(keyEvent({ key: 'Esc' }), 'Escape')).toBe(false)
  })

  it('пробел принимает и легаси-имя Spacebar', () => {
    expect(eventMatchesKey(keyEvent({ key: ' ' }), ' ')).toBe(true)
    expect(eventMatchesKey(keyEvent({ key: 'Spacebar' }), ' ')).toBe(true)
  })
})

describe('shiftSatisfied', () => {
  it('объявленный shift требует нажатого Shift', () => {
    expect(shiftSatisfied(keyEvent({ key: 'A', shiftKey: true }), 'a', true)).toBe(true)
    expect(shiftSatisfied(keyEvent({ key: 'a' }), 'a', true)).toBe(false)
  })

  it('символ, достижимый только через Shift, легален без объявленного shift', () => {
    expect(shiftSatisfied(keyEvent({ key: '?', shiftKey: true }), '?', false)).toBe(true)
  })

  it('буква с нажатым Shift без объявленного shift — не матч', () => {
    expect(shiftSatisfied(keyEvent({ key: 'A', shiftKey: true }), 'a', false)).toBe(false)
  })

  it('цифра с Shift даёт другой символ и не проходит', () => {
    expect(shiftSatisfied(keyEvent({ key: '%', shiftKey: true }), '5', false)).toBe(false)
  })
})

/**
 * Разбор один на пакет: его читают и директива `v-hotkey`, и собственный
 * слушатель `GrCommandPalette`. Два разбора уже расходились молча — гейт держит
 * то, чтобы имена клавиш выходили в том же виде, в каком их даёт браузер.
 */
describe('parseHotkeyCombo', () => {
  it('имена клавиш приводятся к `KeyboardEvent.key`', () => {
    expect(parseHotkeyCombo('esc')?.key).toBe('Escape')
    expect(parseHotkeyCombo('Escape')?.key).toBe('Escape')
    expect(parseHotkeyCombo('space')?.key).toBe(' ')
    // Регистр многобуквенных имён сохраняется: их сравнивают посимвольно.
    expect(parseHotkeyCombo('ArrowUp')?.key).toBe('ArrowUp')
    // Одиночный символ — в нижний: верхний означал бы Shift, а он отдельным токеном.
    expect(parseHotkeyCombo('mod+K')?.key).toBe('k')
  })

  it('модификаторы читаются всеми принятыми написаниями', () => {
    expect(parseHotkeyCombo('ctrl+alt+shift+p')).toMatchObject({ ctrl: true, alt: true, shift: true, key: 'p' })
    expect(parseHotkeyCombo('control+option+P')).toMatchObject({ ctrl: true, alt: true, key: 'p' })
    expect(parseHotkeyCombo('cmd+k')).toMatchObject({ meta: true })
    expect(parseHotkeyCombo('⌘+k')).toMatchObject({ meta: true })
    expect(parseHotkeyCombo('mod+k')).toMatchObject({ mod: true, ctrl: false, meta: false })
  })

  it('пустое сочетание — не сочетание', () => {
    expect(parseHotkeyCombo('')).toBeNull()
    expect(parseHotkeyCombo('+')).toBeNull()
  })
})

describe('parseHotkeySequence', () => {
  it('пробел делит строку на шаги, плюс — клавиши внутри шага', () => {
    expect(parseHotkeySequence('mod+k')).toHaveLength(1)

    const chain = parseHotkeySequence('g i')
    expect(chain).toHaveLength(2)
    expect(chain[0]).toMatchObject({ key: 'g', mod: false })
    expect(chain[1]).toMatchObject({ key: 'i' })

    const mixed = parseHotkeySequence('mod+k p')
    expect(mixed).toHaveLength(2)
    expect(mixed[0]).toMatchObject({ key: 'k', mod: true })
    expect(mixed[1]).toMatchObject({ key: 'p', mod: false })
  })

  /** Сам пробел пишется словом и с разделителем шагов не спорит. */
  it('клавиша «пробел» остаётся одним шагом', () => {
    const steps = parseHotkeySequence('mod+space')

    expect(steps).toHaveLength(1)
    expect(steps[0]).toMatchObject({ key: ' ', mod: true })
  })

  it('лишние пробелы шагов не добавляют', () => {
    expect(parseHotkeySequence('  g   i  ')).toHaveLength(2)
    expect(parseHotkeySequence('   ')).toHaveLength(0)
  })
})
