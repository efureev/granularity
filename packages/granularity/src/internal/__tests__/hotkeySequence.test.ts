import { describe, expect, it } from 'vitest'

import { createHotkeySequenceTracker } from '../hotkeySequence'
import { parseHotkeySequence } from '../keyboard'

function press(key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  return new KeyboardEvent('keydown', { key, ...init })
}

/**
 * Буфер, а не автомат на каждый хоткей: цепочки с общим началом (`g i` и `g p`)
 * буфер разводит сам, тогда как набор автоматов пришлось бы синхронизировать
 * между собой — и сброс одного ронял бы второй.
 */
describe('createHotkeySequenceTracker', () => {
  const gi = parseHotkeySequence('g i')
  const gp = parseHotkeySequence('g p')

  it('цепочка складывается только по порядку', () => {
    const tracker = createHotkeySequenceTracker()

    tracker.push(press('g'), 0)
    expect(tracker.matches(gi), 'на первом шаге цепочка ещё не сложилась').toBe(false)

    tracker.push(press('i'), 100)
    expect(tracker.matches(gi)).toBe(true)
  })

  it('обратный порядок не срабатывает', () => {
    const tracker = createHotkeySequenceTracker()

    tracker.push(press('i'), 0)
    tracker.push(press('g'), 100)

    expect(tracker.matches(gi)).toBe(false)
  })

  it('чужая клавиша между шагами рвёт цепочку', () => {
    const tracker = createHotkeySequenceTracker()

    tracker.push(press('g'), 0)
    tracker.push(press('x'), 50)
    tracker.push(press('i'), 100)

    expect(tracker.matches(gi)).toBe(false)
  })

  it('пауза дольше таймаута забывает набранное', () => {
    const tracker = createHotkeySequenceTracker(1000)

    tracker.push(press('g'), 0)
    tracker.push(press('i'), 1500)

    expect(tracker.matches(gi)).toBe(false)
  })

  it('в пределах таймаута цепочка живёт', () => {
    const tracker = createHotkeySequenceTracker(1000)

    tracker.push(press('g'), 0)
    tracker.push(press('i'), 999)

    expect(tracker.matches(gi)).toBe(true)
  })

  /** `Shift` перед `I` — часть самого `I`, а не отдельный шаг. */
  it('нажатие одного модификатора цепочку не рвёт', () => {
    const tracker = createHotkeySequenceTracker()

    tracker.push(press('g'), 0)
    expect(tracker.push(press('Shift', { shiftKey: true }), 50), 'модификатор в буфер не идёт').toBe(false)
    tracker.push(press('i'), 100)

    expect(tracker.matches(gi)).toBe(true)
  })

  /**
   * Сверяется хвост буфера, а не его начало: набранное до цепочки к ней
   * отношения не имеет, и «g i» после случайного «x» обязано сработать.
   */
  it('нажатия до цепочки ей не мешают', () => {
    const tracker = createHotkeySequenceTracker()

    tracker.push(press('x'), 0)
    tracker.push(press('g'), 50)
    tracker.push(press('i'), 100)

    expect(tracker.matches(gi)).toBe(true)
  })

  it('цепочки с общим началом разводятся', () => {
    const tracker = createHotkeySequenceTracker()

    tracker.push(press('g'), 0)
    tracker.push(press('p'), 100)

    expect(tracker.matches(gp)).toBe(true)
    expect(tracker.matches(gi)).toBe(false)
  })

  it('шаги с модификаторами сверяются целиком', () => {
    const tracker = createHotkeySequenceTracker()
    const steps = parseHotkeySequence('ctrl+k p')

    tracker.push(press('k'), 0)
    tracker.push(press('p'), 50)
    expect(tracker.matches(steps), 'без Ctrl первый шаг не тот').toBe(false)

    tracker.reset()
    tracker.push(press('k', { ctrlKey: true }), 100)
    tracker.push(press('p'), 150)
    expect(tracker.matches(steps)).toBe(true)
  })

  it('`reset` забывает набранное', () => {
    const tracker = createHotkeySequenceTracker()

    tracker.push(press('g'), 0)
    tracker.reset()
    tracker.push(press('i'), 50)

    expect(tracker.matches(gi)).toBe(false)
  })
})
