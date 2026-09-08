import { afterEach, describe, expect, it, vi } from 'vitest'

import { isEyeDropperSupported, pickScreenColor } from '../eyeDropper'

/** Подменяет `window.EyeDropper` на время одного теста. */
function stubEyeDropper(open: () => Promise<{ sRGBHex: string }>): void {
  Object.defineProperty(window, 'EyeDropper', {
    configurable: true,
    writable: true,
    value: class {
      open = open
    },
  })
}

afterEach(() => {
  Reflect.deleteProperty(window, 'EyeDropper')
})

describe('eyeDropper', () => {
  it('без API пипетки нет: кнопка не должна появляться там, где нажатие ничего не даст', async () => {
    expect(isEyeDropperSupported()).toBe(false)
    expect(await pickScreenColor()).toBeNull()
  })

  it('с API возвращает выбранный цвет', async () => {
    stubEyeDropper(async () => ({ sRGBHex: '#12ab34' }))

    expect(isEyeDropperSupported()).toBe(true)
    expect(await pickScreenColor()).toBe('#12ab34')
  })

  it('отказ пользователя — не ошибка: `open` отклоняется `AbortError` и на Esc', async () => {
    stubEyeDropper(async () => {
      throw new DOMException('cancelled', 'AbortError')
    })

    await expect(pickScreenColor()).resolves.toBeNull()
  })

  it('сигнал обрыва доезжает до API', async () => {
    const open = vi.fn(async () => ({ sRGBHex: '#000000' }))
    stubEyeDropper(open)

    const controller = new AbortController()
    await pickScreenColor(controller.signal)

    expect(open).toHaveBeenCalledWith({ signal: controller.signal })
  })
})
