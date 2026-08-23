import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import { mount } from '@vue/test-utils'

import type { GrDashboardResponsiveLayout } from '../../layout'
import { serializeLayout } from '../../layout'
import type { GrDashboardLayoutStorage } from '../useDashboardLayout'
import { useDashboardLayout } from '../useDashboardLayout'

const initial: GrDashboardResponsiveLayout = { lg: [{ id: 'a', x: 0, y: 0, w: 4, h: 2 }] }
const stored: GrDashboardResponsiveLayout = { lg: [{ id: 'a', x: 6, y: 0, w: 2, h: 1 }] }

function memoryStorage(seed?: string): GrDashboardLayoutStorage & { data: Map<string, string> } {
  const data = new Map<string, string>()
  if (seed !== undefined)
    data.set('dash', seed)

  return {
    data,
    load: key => data.get(key) ?? null,
    save: (key, value) => { data.set(key, value) },
    remove: (key) => { data.delete(key) },
  }
}

/** Композабл требует контекста компонента: чтение хранилища живёт в `onMounted`. */
function run(options: Parameters<typeof useDashboardLayout>[0]) {
  let api: ReturnType<typeof useDashboardLayout> | null = null

  const wrapper = mount(defineComponent({
    setup: () => {
      api = useDashboardLayout(options)

      return () => null
    },
  }))

  return { api: api as unknown as ReturnType<typeof useDashboardLayout>, wrapper }
}

afterEach(() => vi.useRealTimers())

describe('useDashboardLayout', () => {
  it('без хранилища работает как обычный ref', async () => {
    const { api } = run({ initial })
    await nextTick()

    expect(api.layout.value).toEqual(initial)
    expect(api.isRestored.value).toBe(true)
  })

  it('восстанавливает сохранённую раскладку после монтирования', async () => {
    const storage = memoryStorage(serializeLayout(stored))
    const { api } = run({ initial, storage, key: 'dash' })
    await nextTick()

    expect(api.layout.value).toEqual(stored)
  })

  it('первый рендер отдаёт initial — хранилище в setup не читается', () => {
    const storage = memoryStorage(serializeLayout(stored))
    let seen: GrDashboardResponsiveLayout | null = null

    mount(defineComponent({
      setup: () => {
        const { layout } = useDashboardLayout({ initial, storage, key: 'dash' })
        // Значение на момент первого рендера — то, что уедет в серверный HTML.
        seen = layout.value

        return () => null
      },
    }))

    expect(seen).toEqual(initial)
  })

  it('испорченная запись не роняет страницу и оставляет initial', async () => {
    const storage = memoryStorage('{ это не json')
    const { api } = run({ initial, storage, key: 'dash' })
    await nextTick()

    expect(api.layout.value).toEqual(initial)
  })

  it('чужую версию без migrate игнорирует, с migrate — принимает', async () => {
    const legacy = memoryStorage(serializeLayout(stored, 99))

    const plain = run({ initial, storage: legacy, key: 'dash' })
    await nextTick()
    expect(plain.api.layout.value).toEqual(initial)

    const migrated = run({
      initial,
      storage: memoryStorage(serializeLayout(stored, 99)),
      key: 'dash',
      migrate: (_raw, from) => (from === 99 ? stored : null),
    })
    await nextTick()
    expect(migrated.api.layout.value).toEqual(stored)
  })

  it('пишет с паузой, а не на каждое изменение', async () => {
    vi.useFakeTimers()
    const storage = memoryStorage()
    const { api } = run({ initial, storage, key: 'dash', debounce: 300 })
    await nextTick()

    api.layout.value = { lg: [{ id: 'a', x: 1, y: 0, w: 4, h: 2 }] }
    await nextTick()
    api.layout.value = { lg: [{ id: 'a', x: 2, y: 0, w: 4, h: 2 }] }
    await nextTick()

    expect(storage.data.has('dash')).toBe(false)

    vi.advanceTimersByTime(300)
    expect(JSON.parse(storage.data.get('dash') ?? '{}')).toMatchObject({
      layout: { lg: [{ id: 'a', x: 2 }] },
    })
  })

  it('flush записывает немедленно', async () => {
    vi.useFakeTimers()
    const storage = memoryStorage()
    const { api } = run({ initial, storage, key: 'dash' })
    await nextTick()

    api.layout.value = stored
    await nextTick()
    api.flush()

    expect(storage.data.has('dash')).toBe(true)
  })

  it('размонтирование не теряет несохранённое', async () => {
    vi.useFakeTimers()
    const storage = memoryStorage()
    const { api, wrapper } = run({ initial, storage, key: 'dash' })
    await nextTick()

    api.layout.value = stored
    await nextTick()
    wrapper.unmount()

    expect(storage.data.has('dash')).toBe(true)
  })

  it('reset возвращает initial и убирает запись', async () => {
    const storage = memoryStorage(serializeLayout(stored))
    const { api } = run({ initial, storage, key: 'dash' })
    await nextTick()

    api.reset()

    expect(api.layout.value).toEqual(initial)
    expect(storage.data.has('dash')).toBe(false)
  })
})

describe('localStorageLayoutStorage', () => {
  it('переживает недоступное хранилище', async () => {
    const { localStorageLayoutStorage } = await import('../useDashboardLayout')
    const storage = localStorageLayoutStorage()
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceeded')
    })

    expect(() => storage.save('dash', '{}')).not.toThrow()
    spy.mockRestore()
  })
})
