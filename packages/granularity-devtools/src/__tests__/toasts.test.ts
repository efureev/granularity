import { describe, expect, it } from 'vitest'

import type { ToastStateLike } from '../resolve/toasts'
import { toastQueue } from '../resolve/toasts'

function state(patch: Partial<ToastStateLike> = {}): ToastStateLike {
  return {
    toasts: [{ id: 'a', title: 'Сохранено', tone: 'success', timeoutMs: 3500 }],
    timers: new Map([['a', { remaining: 1200 }]]),
    maxToasts: 20,
    ...patch,
  }
}

describe('очередь тостов', () => {
  it('без состояния молчит, а не выдумывает пустую очередь', () => {
    expect(toastQueue(undefined)).toBeNull()
  })

  it('показывает остаток таймера из состояния, а не из тоста', () => {
    expect(toastQueue(state())?.entries[0]).toMatchObject({ timeoutMs: 3500, remainingMs: 1200 })
  })

  it('тост без таймера отличается от тоста с нулевым остатком', () => {
    const queue = toastQueue(state({ timers: new Map() }))

    expect(queue?.entries[0]?.remainingMs).toBeNull()
  })

  it('очередь у потолка помечена: это ответ на «куда делись уведомления»', () => {
    const toasts = Array.from({ length: 3 }, (_, index) => ({ id: `t${index}`, title: 'x', tone: 'info', timeoutMs: 0 }))
    const queue = toastQueue(state({ toasts, timers: new Map(), maxToasts: 3 }))

    expect(queue).toMatchObject({ size: 3, limit: 3, atLimit: true })
  })

  it('пока есть запас, потолок не тревожит', () => {
    expect(toastQueue(state())?.atLimit).toBe(false)
  })

  it('ключ схлопывания виден: повторы прячутся именно по нему', () => {
    const queue = toastQueue(state({
      toasts: [{ id: 'a', title: 'Ошибка сети', tone: 'danger', timeoutMs: 0, dedupeKey: 'net' }],
    }))

    expect(queue?.entries[0]?.dedupeKey).toBe('net')
  })
})

describe('раздел без установленного плагина', () => {
  it('очередь без состояния — не пустая очередь, а отсутствие данных', () => {
    // Разные вещи: `null` значит «состояние недоступно», пустой список — «тостов нет».
    expect(toastQueue(undefined)).toBeNull()
    expect(toastQueue(state({ toasts: [], timers: new Map() }))).toMatchObject({ size: 0, atLimit: false })
  })
})
