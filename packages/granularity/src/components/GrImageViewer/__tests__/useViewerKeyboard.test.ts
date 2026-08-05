import { describe, expect, it, vi } from 'vitest'

import { useViewerKeyboard } from '../composables/useViewerKeyboard'

function setup() {
  const actions = {
    close: vi.fn(),
    prev: vi.fn(),
    next: vi.fn(),
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
    reset: vi.fn(),
  }
  const { onKeydown } = useViewerKeyboard({ actions })

  function press(key: string) {
    const preventDefault = vi.fn()
    onKeydown({ key, preventDefault } as unknown as KeyboardEvent)
    return preventDefault
  }

  return { actions, press }
}

describe('useViewerKeyboard', () => {
  it.each([
    ['ArrowLeft', 'prev'],
    ['ArrowRight', 'next'],
    ['+', 'zoomIn'],
    ['=', 'zoomIn'],
    ['Add', 'zoomIn'],
    ['-', 'zoomOut'],
    ['_', 'zoomOut'],
    ['Subtract', 'zoomOut'],
    ['0', 'reset'],
  ] as const)('%s → %s, событие гасится', (key, action) => {
    const { actions, press } = setup()

    const preventDefault = press(key)

    expect(actions[action]).toHaveBeenCalledTimes(1)
    expect(preventDefault).toHaveBeenCalled()
  })

  it('Escape не обрабатывает: закрытие идёт через общий стек слоёв', () => {
    const { actions, press } = setup()

    const preventDefault = press('Escape')

    expect(actions.close).not.toHaveBeenCalled()
    expect(preventDefault).not.toHaveBeenCalled()
  })

  it('посторонние клавиши проходят насквозь', () => {
    const { actions, press } = setup()

    const preventDefault = press('a')

    expect(preventDefault).not.toHaveBeenCalled()
    expect(Object.values(actions).every(fn => fn.mock.calls.length === 0)).toBe(true)
  })
})
