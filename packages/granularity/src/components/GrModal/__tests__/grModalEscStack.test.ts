import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  pushGrModalEsc,
  removeGrModalEsc,
  resetGrModalEscStack,
} from '../grModalEscStack'

function pressEscape(): KeyboardEvent {
  const event = new KeyboardEvent('keydown', {
    key: 'Escape',
    bubbles: true,
    cancelable: true,
  })
  window.dispatchEvent(event)
  return event
}

describe('granularity/GrModal grModalEscStack (unit)', () => {
  afterEach(() => {
    resetGrModalEscStack()
  })

  it('Esc закрывает только верхнюю (последнюю зарегистрированную) модалку', () => {
    const closeBottom = vi.fn()
    const closeTop = vi.fn()

    pushGrModalEsc({ shouldClose: () => true, close: closeBottom })
    pushGrModalEsc({ shouldClose: () => true, close: closeTop })

    pressEscape()

    expect(closeTop).toHaveBeenCalledTimes(1)
    expect(closeBottom).not.toHaveBeenCalled()
  })

  it('после закрытия верхней модалки Esc адресуется следующей по стеку', () => {
    const closeBottom = vi.fn()
    const closeTop = vi.fn()

    pushGrModalEsc({ shouldClose: () => true, close: closeBottom })
    const topId = pushGrModalEsc({ shouldClose: () => true, close: closeTop })

    pressEscape()
    removeGrModalEsc(topId)
    pressEscape()

    expect(closeTop).toHaveBeenCalledTimes(1)
    expect(closeBottom).toHaveBeenCalledTimes(1)
  })

  it('Esc гасится (preventDefault), но не закрывает верхнюю модалку при shouldClose=false', () => {
    const closeBottom = vi.fn()
    const closeTop = vi.fn()

    pushGrModalEsc({ shouldClose: () => true, close: closeBottom })
    pushGrModalEsc({ shouldClose: () => false, close: closeTop })

    const event = pressEscape()

    expect(closeTop).not.toHaveBeenCalled()
    expect(closeBottom).not.toHaveBeenCalled()
    expect(event.defaultPrevented).toBe(true)
  })

  it('после опустошения стека обработчик снимается и Esc игнорируется', () => {
    const close = vi.fn()
    const id = pushGrModalEsc({ shouldClose: () => true, close })
    removeGrModalEsc(id)

    pressEscape()

    expect(close).not.toHaveBeenCalled()
  })
})
