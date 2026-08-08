import { describe, expect, it } from 'vitest'

import { codeForChar, eventMatchesKey, isComposingEvent, shiftSatisfied } from '../keyboard'

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
