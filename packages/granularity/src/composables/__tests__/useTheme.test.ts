import { mount } from '@vue/test-utils'
import { createApp, defineComponent } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { granularityThemePlugin, initThemeEarly, useTheme, type UseThemeOptions } from '../useTheme'

const DEFAULT_STORAGE_KEY = 'gr-theme'

/**
 * Чистое окружение темы. Общее на оба блока: тесты подменяют `localStorage`
 * (в том числе на сломанный, без `setItem`), и без сброса такой мок утекал бы
 * в соседний блок.
 */
function resetThemeEnvironment(): void {
  // `matchMedia` подменяется в тестах системной темы; без снятия заглушки
  // соседний блок стартовал бы с `prefers-color-scheme: dark`.
  vi.unstubAllGlobals()
  document.documentElement.className = ''
  delete document.documentElement.dataset.theme

  const storage = new Map<string, string>()
  const localStorageMock: Storage = {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, String(value))
    },
    removeItem: (key: string) => {
      storage.delete(key)
    },
    clear: () => {
      storage.clear()
    },
    key: (index: number) => [...storage.keys()][index] ?? null,
    get length() {
      return storage.size
    },
  }

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    configurable: true,
  })
}

describe('useTheme (helpers)', () => {
  beforeEach(resetThemeEnvironment)

  it('initThemeEarly should apply the preferred theme to the document', () => {
    window.localStorage.setItem(DEFAULT_STORAGE_KEY, 'light')
    initThemeEarly()
    expect(document.documentElement.dataset.theme).toBe('light')

    window.localStorage.setItem(DEFAULT_STORAGE_KEY, 'dark')
    initThemeEarly()
    expect(document.documentElement.dataset.theme).toBe('dark')
    // Класс `.theme-dark` снят: тема выражается только data-атрибутом.
    expect(document.documentElement.classList.contains('theme-dark')).toBe(false)
  })

  it('initThemeEarly should read from localStorage first', () => {
    window.localStorage.setItem(DEFAULT_STORAGE_KEY, 'dark')
    initThemeEarly()
    expect(document.documentElement.dataset.theme).toBe('dark')

    window.localStorage.setItem(DEFAULT_STORAGE_KEY, 'light')
    initThemeEarly()
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('initThemeEarly should support custom storageKey', () => {
    window.localStorage.setItem('my-theme', 'dark')
    initThemeEarly({ storageKey: 'my-theme' })
    expect(document.documentElement.dataset.theme).toBe('dark')

    delete document.documentElement.dataset.theme
    document.documentElement.className = ''
    initThemeEarly()
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('initThemeEarly should fallback to prefers-color-scheme when storage is empty', () => {
    const matchMedia = vi.fn().mockReturnValue({ matches: true })
    vi.stubGlobal('matchMedia', matchMedia)

    initThemeEarly()
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)')
  })

  it('initThemeEarly should not throw when localStorage is missing getItem', () => {
    Object.defineProperty(window, 'localStorage', {
      value: {},
      configurable: true,
    })

    expect(() => initThemeEarly()).not.toThrow()
  })

  it('useTheme should persist into provided storageKey by default', () => {
    const { setTheme } = useTheme({ storageKey: 'app-theme' })
    setTheme('dark')

    expect(window.localStorage.getItem('app-theme')).toBe('dark')
    expect(window.localStorage.getItem(DEFAULT_STORAGE_KEY)).toBe(null)
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('useTheme should not touch localStorage when persist=false', () => {
    const { setTheme } = useTheme({ storageKey: 'app-theme', persist: false })
    setTheme('dark')

    expect(window.localStorage.getItem('app-theme')).toBe(null)
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('useTheme should not throw when localStorage is missing setItem', () => {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: () => null,
      },
      configurable: true,
    })

    const { setTheme } = useTheme({ storageKey: 'app-theme' })
    expect(() => setTheme('dark')).not.toThrow()
    expect(document.documentElement.dataset.theme).toBe('dark')
  })
})
/**
 * Состояние темы — app-scoped через плагин, с модульным фолбэком для простых SPA.
 *
 * Серверная половина контракта (запрет мутации без плагина) живёт в
 * `apps/playground-ssr`: `typeof window` там настоящий, а в jsdom его не
 * подделать так, чтобы не рассыпался сам Vue.
 */
describe('useTheme — состояние приложения', () => {
  beforeEach(resetThemeEnvironment)

  function mountWithTheme(plugin?: [typeof granularityThemePlugin, UseThemeOptions?]) {
    let api: ReturnType<typeof useTheme> | null = null

    const wrapper = mount(defineComponent({
      setup() {
        api = useTheme()
        return () => null
      },
    }), plugin ? { global: { plugins: [plugin] } } : undefined)

    return { wrapper, api: api! }
  }

  it('без плагина два приложения делят модульное состояние', () => {
    const first = mountWithTheme()
    const second = mountWithTheme()

    first.api.setTheme('dark')

    // Канонический фолбэк для SPA: `useTheme()` из любого места — одна тема.
    expect(second.api.theme.value).toBe('dark')
    expect(second.api.isDark.value).toBe(true)

    first.wrapper.unmount()
    second.wrapper.unmount()
  })

  it('с плагином у каждого приложения тема своя', () => {
    const first = mountWithTheme([granularityThemePlugin])
    const second = mountWithTheme([granularityThemePlugin])

    first.api.setTheme('dark')
    second.api.setTheme('light')

    // Иначе два независимых приложения на одной странице делили бы одну тему.
    expect(first.api.theme.value).toBe('dark')
    expect(second.api.theme.value).toBe('light')

    first.wrapper.unmount()
    second.wrapper.unmount()
  })

  it('плагин с `target` пишет тему в корень приложения, а не в documentElement', () => {
    const rootA = document.createElement('div')
    const rootB = document.createElement('div')
    document.body.append(rootA, rootB)

    const first = mountWithTheme([granularityThemePlugin, { target: () => rootA, persist: false }])
    const second = mountWithTheme([granularityThemePlugin, { target: () => rootB, persist: false }])

    first.api.setTheme('dark')
    second.api.setTheme('light')

    // Ради этого target и существует: темы приложений не перетирают друг друга.
    expect(rootA.dataset.theme).toBe('dark')
    expect(rootB.dataset.theme).toBe('light')
    expect(document.documentElement.dataset.theme).toBeUndefined()

    first.wrapper.unmount()
    second.wrapper.unmount()
    rootA.remove()
    rootB.remove()
  })

  it('unmount приложения снимает window-слушатели app-scoped состояния', () => {
    const root = document.createElement('div')
    document.body.append(root)

    const { wrapper, api } = mountWithTheme([granularityThemePlugin, { storageKey: 'dead-theme', target: () => root }])
    expect(api.theme.value).toBe('light')

    wrapper.unmount()

    // Слушатель мёртвого приложения не должен ни менять состояние, ни трогать DOM.
    window.dispatchEvent(new StorageEvent('storage', { key: 'dead-theme', newValue: 'dark' }))

    expect(api.theme.value).toBe('light')
    expect(root.dataset.theme).toBeUndefined()

    root.remove()
  })

  it('storage-событие другой вкладки применяет тему к `target`', () => {
    const root = document.createElement('div')
    document.body.append(root)

    const { wrapper, api } = mountWithTheme([granularityThemePlugin, { storageKey: 'scoped-theme', target: () => root }])

    window.dispatchEvent(new StorageEvent('storage', { key: 'scoped-theme', newValue: 'dark' }))

    expect(api.theme.value).toBe('dark')
    expect(root.dataset.theme).toBe('dark')
    expect(document.documentElement.dataset.theme).toBeUndefined()

    wrapper.unmount()
    root.remove()
  })

  it('app.runWithContext достаёт app-scoped тему', () => {
    const root = document.createElement('div')
    document.body.append(root)

    const app = createApp({ render: () => null })
    app.use(granularityThemePlugin, { persist: false, target: () => root })
    app.mount(document.createElement('div'))

    app.runWithContext(() => useTheme()).setTheme('dark')

    expect(root.dataset.theme).toBe('dark')
    expect(document.documentElement.dataset.theme).toBeUndefined()

    app.unmount()
    root.remove()
  })

  it('плагин принимает свои `storageKey` и `persist`', () => {
    const { wrapper, api } = mountWithTheme([granularityThemePlugin, { storageKey: 'admin-theme' }])

    api.setTheme('dark')

    expect(window.localStorage.getItem('admin-theme')).toBe('dark')
    expect(window.localStorage.getItem(DEFAULT_STORAGE_KEY)).toBe(null)
    wrapper.unmount()
  })
})
