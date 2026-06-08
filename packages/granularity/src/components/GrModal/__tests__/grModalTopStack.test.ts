import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  pushGrModalTop,
  removeGrModalTop,
  resetGrModalTopStack,
} from '../grModalTopStack'

describe('granularity/GrModal grModalTopStack (unit)', () => {
  afterEach(() => {
    resetGrModalTopStack()
  })

  it('верхней считается последняя зарегистрированная модалка', () => {
    const bottom = vi.fn()
    const top = vi.fn()

    pushGrModalTop({ setTopmost: bottom })
    expect(bottom).toHaveBeenLastCalledWith(true)

    pushGrModalTop({ setTopmost: top })

    // Нижняя перестаёт быть верхней, новая становится верхней.
    expect(bottom).toHaveBeenLastCalledWith(false)
    expect(top).toHaveBeenLastCalledWith(true)
  })

  it('после закрытия верхней модалки следующая снова становится верхней', () => {
    const bottom = vi.fn()
    const top = vi.fn()

    pushGrModalTop({ setTopmost: bottom })
    const topId = pushGrModalTop({ setTopmost: top })

    removeGrModalTop(topId)

    expect(bottom).toHaveBeenLastCalledWith(true)
  })

  it('единственная открытая модалка всегда верхняя', () => {
    const only = vi.fn()
    pushGrModalTop({ setTopmost: only })
    expect(only).toHaveBeenLastCalledWith(true)
  })
})
