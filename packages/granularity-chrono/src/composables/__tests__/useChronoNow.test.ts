import { effectScope, nextTick, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { chronoTickerIntervals, resetChronoNow, useChronoNow } from '../useChronoNow'

const START = new Date(2026, 7, 12, 12, 0, 0)

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(START)
})

afterEach(() => {
  resetChronoNow()
  vi.useRealTimers()
  setVisibility('visible')
})

/** `visibilityState` — свойство только на чтение; в jsdom подменяется дескриптором. */
function setVisibility(state: DocumentVisibilityState): void {
  Object.defineProperty(document, 'visibilityState', { value: state, configurable: true })
  document.dispatchEvent(new Event('visibilitychange'))
}

/** Композабл живёт в scope: без него некому снять подписку. */
function inScope<T>(body: () => T): { value: T, dispose: () => void } {
  const scope = effectScope()
  const value = scope.run(body) as T

  return { value, dispose: () => scope.stop() }
}

describe('общее «сейчас»', () => {
  it('обновляется тактом', async () => {
    const { value: now, dispose } = inScope(() => useChronoNow(1000))
    expect(now.value).toEqual(START)

    vi.advanceTimersByTime(1000)
    await nextTick()

    expect(now.value).toEqual(new Date(2026, 7, 12, 12, 0, 1))
    dispose()
  })

  it('два подписчика на один такт делят один таймер', () => {
    // Ради этого композабл и существует: сто строк ленты — это один
    // `setInterval`, а не сто.
    const first = inScope(() => useChronoNow(1000))
    const second = inScope(() => useChronoNow(1000))

    expect(chronoTickerIntervals()).toHaveLength(1)
    expect(vi.getTimerCount()).toBe(1)

    first.dispose()
    second.dispose()
  })

  it('подписчики видят одно и то же значение', async () => {
    const first = inScope(() => useChronoNow(1000))
    const second = inScope(() => useChronoNow(1000))

    vi.advanceTimersByTime(1000)
    await nextTick()

    expect(second.value.value).toEqual(first.value.value)
    first.dispose()
    second.dispose()
  })

  it('разные такты — разные таймеры', () => {
    const fast = inScope(() => useChronoNow(1000))
    const slow = inScope(() => useChronoNow(60_000))

    expect(chronoTickerIntervals()).toEqual([1000, 60_000])

    fast.dispose()
    slow.dispose()
  })
})

describe('смена такта', () => {
  it('переносит подписку и гасит осиротевший таймер', async () => {
    const interval = ref(1000)
    const { dispose } = inScope(() => useChronoNow(interval))
    expect(chronoTickerIntervals()).toHaveLength(1)

    interval.value = 60_000
    await nextTick()

    expect(chronoTickerIntervals(), 'старый такт остался без подписчиков').toEqual([60_000])
    expect(vi.getTimerCount()).toBe(1)
    dispose()
  })

  it('чужой таймер на прежнем такте продолжает жить', async () => {
    const other = inScope(() => useChronoNow(1000))
    const interval = ref(1000)
    const mine = inScope(() => useChronoNow(interval))

    interval.value = 60_000
    await nextTick()

    expect(chronoTickerIntervals()).toEqual([1000, 60_000])
    other.dispose()
    mine.dispose()
  })
})

describe('скрытая вкладка', () => {
  it('таймеры снимаются', () => {
    const { dispose } = inScope(() => useChronoNow(1000))
    expect(vi.getTimerCount()).toBe(1)

    setVisibility('hidden')

    expect(vi.getTimerCount(), 'читать некому, а таймер будил бы процесс').toBe(0)
    dispose()
  })

  it('на скрытой вкладке значение не меняется', async () => {
    const { value: now, dispose } = inScope(() => useChronoNow(1000))
    setVisibility('hidden')

    vi.advanceTimersByTime(10_000)
    await nextTick()

    expect(now.value).toEqual(START)
    dispose()
  })

  it('возврат обновляет значение сразу, а не через такт', async () => {
    const { value: now, dispose } = inScope(() => useChronoNow(60_000))
    setVisibility('hidden')

    vi.setSystemTime(new Date(2026, 7, 12, 12, 30, 0))
    setVisibility('visible')
    await nextTick()

    // Иначе вернувшийся пользователь целую минуту смотрит на «полчаса назад».
    expect(now.value).toEqual(new Date(2026, 7, 12, 12, 30, 0))
    expect(vi.getTimerCount(), 'такт возобновлён').toBe(1)
    dispose()
  })

  it('подписка на скрытой вкладке не заводит таймера', () => {
    setVisibility('hidden')
    const { dispose } = inScope(() => useChronoNow(1000))

    expect(vi.getTimerCount()).toBe(0)
    dispose()
  })
})

describe('снятие подписки', () => {
  it('последний ушедший гасит таймер', () => {
    const { dispose } = inScope(() => useChronoNow(1000))
    expect(vi.getTimerCount()).toBe(1)

    dispose()

    expect(chronoTickerIntervals()).toHaveLength(0)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('пока есть хоть один подписчик, таймер жив', () => {
    const first = inScope(() => useChronoNow(1000))
    const second = inScope(() => useChronoNow(1000))

    first.dispose()

    expect(vi.getTimerCount()).toBe(1)
    second.dispose()
    expect(vi.getTimerCount()).toBe(0)
  })
})
