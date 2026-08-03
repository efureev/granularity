import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  pushDismissLayer,
  removeDismissLayer,
  resetDismissStack,
} from '../dismissStack'

function pressEscape(): KeyboardEvent {
  const event = new KeyboardEvent('keydown', {
    key: 'Escape',
    bubbles: true,
    cancelable: true,
  })
  window.dispatchEvent(event)
  return event
}

describe('стек dismissible-слоёв (unit)', () => {
  afterEach(() => {
    resetDismissStack()
  })

  it('Esc закрывает только верхний (последний зарегистрированный) слой', () => {
    const closeBottom = vi.fn()
    const closeTop = vi.fn()

    pushDismissLayer({ shouldClose: () => true, close: closeBottom })
    pushDismissLayer({ shouldClose: () => true, close: closeTop })

    pressEscape()

    expect(closeTop).toHaveBeenCalledTimes(1)
    expect(closeBottom).not.toHaveBeenCalled()
  })

  it('после закрытия верхнего слоя Esc адресуется следующему по стеку', () => {
    const closeBottom = vi.fn()
    const closeTop = vi.fn()

    pushDismissLayer({ shouldClose: () => true, close: closeBottom })
    const topId = pushDismissLayer({ shouldClose: () => true, close: closeTop })

    pressEscape()
    removeDismissLayer(topId)
    pressEscape()

    expect(closeTop).toHaveBeenCalledTimes(1)
    expect(closeBottom).toHaveBeenCalledTimes(1)
  })

  it('Esc гасится (preventDefault), но не закрывает верхний слой при shouldClose=false', () => {
    const closeBottom = vi.fn()
    const closeTop = vi.fn()

    pushDismissLayer({ shouldClose: () => true, close: closeBottom })
    pushDismissLayer({ shouldClose: () => false, close: closeTop })

    const event = pressEscape()

    expect(closeTop).not.toHaveBeenCalled()
    expect(closeBottom).not.toHaveBeenCalled()
    expect(event.defaultPrevented).toBe(true)
  })

  it('после опустошения стека обработчик снимается и Esc игнорируется', () => {
    const close = vi.fn()
    const id = pushDismissLayer({ shouldClose: () => true, close })
    removeDismissLayer(id)

    pressEscape()

    expect(close).not.toHaveBeenCalled()
  })
})
