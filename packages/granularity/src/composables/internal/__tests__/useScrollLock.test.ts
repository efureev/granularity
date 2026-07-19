import { afterEach, describe, expect, it } from 'vitest'

import { resetScrollLock, useScrollLock } from '../useScrollLock'

afterEach(() => {
  resetScrollLock()
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''
})

describe('useScrollLock', () => {
  it('locks the body scroll and restores it on unlock', () => {
    const { lock, unlock } = useScrollLock()

    lock()
    expect(document.body.style.overflow).toBe('hidden')

    unlock()
    expect(document.body.style.overflow).toBe('')
  })

  it('is reference-counted: closing overlays out of LIFO order keeps the lock until the last unlock', () => {
    const a = useScrollLock()
    const b = useScrollLock()

    a.lock()
    b.lock()
    expect(document.body.style.overflow).toBe('hidden')

    // Закрываем A первым (не в порядке LIFO) — фон всё ещё залочен, т.к. B открыт.
    a.unlock()
    expect(document.body.style.overflow).toBe('hidden')

    b.unlock()
    expect(document.body.style.overflow).toBe('')
  })

  it('is idempotent per instance (double lock/unlock does not skew the counter)', () => {
    const a = useScrollLock()
    const b = useScrollLock()

    a.lock()
    a.lock() // no-op
    b.lock()

    a.unlock()
    a.unlock() // no-op
    expect(document.body.style.overflow).toBe('hidden')

    b.unlock()
    expect(document.body.style.overflow).toBe('')
  })
})
