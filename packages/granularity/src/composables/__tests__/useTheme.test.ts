import { mount } from '@vue/test-utils'
import { computed, createApp, defineComponent } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { granularityThemePlugin, type GrThemeManifest, initThemeEarly, useTheme, type UseThemeOptions } from '../useTheme'

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
  document.documentElement.removeAttribute('data-look')

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

const OCEAN_MANIFEST: GrThemeManifest = {
  themes: [{
    id: 'clay',
    title: 'Глина',
    modes: [
      { name: 'light', colorScheme: 'light', value: 'clay-light' },
      { name: 'ocean', colorScheme: 'dark', value: 'clay-ocean' },
      { name: 'dark', colorScheme: 'dark', value: 'clay-dark' },
    ],
    defaultMode: 'light',
  }],
  defaultTheme: 'clay',
  activation: { attribute: 'data-look' },
}

/** Основная `clay` и дополнительная `paper` со своим листом. */
const TWO_THEMES: GrThemeManifest = {
  ...OCEAN_MANIFEST,
  themes: [
    OCEAN_MANIFEST.themes[0],
    {
      id: 'paper',
      title: 'Бумага',
      modes: [{ name: 'light', colorScheme: 'light', value: 'paper-light' }, { name: 'dark', colorScheme: 'dark', value: 'paper-dark' }],
      defaultMode: 'light',
      href: '/assets/granum-theme-paper.css',
    },
  ],
}

describe('useTheme (helpers)', () => {
  beforeEach(resetThemeEnvironment)

  it('initThemeEarly ставит пару сохранённого режима; старый сохранённый `dark` поднимается как режим', () => {
    window.localStorage.setItem(DEFAULT_STORAGE_KEY, 'dark')
    initThemeEarly()
    expect(document.documentElement.dataset.theme).toBe('slate-dark')
    expect(useTheme().mode.value).toBe('dark')
    // Класс `.theme-dark` снят: режим выражается только data-атрибутом.
    expect(document.documentElement.classList.contains('theme-dark')).toBe(false)

    delete document.documentElement.dataset.theme
    window.localStorage.setItem(DEFAULT_STORAGE_KEY, 'light')
    initThemeEarly()
    expect(document.documentElement.dataset.theme).toBe('slate-light')
  })

  it('пара на корне (серверный HTML, скрипт в head) побеждает хранилище и не перезаписывается', () => {
    document.documentElement.dataset.theme = 'slate-dark'
    window.localStorage.setItem(DEFAULT_STORAGE_KEY, 'light')

    initThemeEarly()

    expect(document.documentElement.dataset.theme).toBe('slate-dark')
    expect(useTheme().mode.value).toBe('dark')
    expect(window.localStorage.getItem(DEFAULT_STORAGE_KEY)).toBe('light')
  })

  it('неизвестный сохранённый режим не применяется — дальше системная схема', () => {
    window.localStorage.setItem(DEFAULT_STORAGE_KEY, 'sepia')
    initThemeEarly()
    expect(document.documentElement.dataset.theme).toBe('slate-light')
  })

  it('initThemeEarly читает свой storageKey', () => {
    window.localStorage.setItem('my-theme', 'dark')
    initThemeEarly({ storageKey: 'my-theme' })
    expect(document.documentElement.dataset.theme).toBe('slate-dark')

    delete document.documentElement.dataset.theme
    initThemeEarly()
    expect(document.documentElement.dataset.theme).toBe('slate-light')
  })

  it('без сохранённого — первый режим с colorScheme системной схемы', () => {
    const matchMedia = vi.fn().mockReturnValue({ matches: true })
    vi.stubGlobal('matchMedia', matchMedia)

    initThemeEarly({ manifest: OCEAN_MANIFEST })
    expect(document.documentElement.getAttribute('data-look')).toBe('clay-ocean')
    expect(matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)')
  })

  it('initThemeEarly не бросает, если у localStorage нет getItem', () => {
    Object.defineProperty(window, 'localStorage', {
      value: {},
      configurable: true,
    })

    expect(() => initThemeEarly()).not.toThrow()
  })

  it('useTheme пишет режим под свой storageKey', () => {
    const { setMode } = useTheme({ storageKey: 'app-theme' })
    setMode('dark')

    expect(window.localStorage.getItem('app-theme')).toBe('dark')
    expect(window.localStorage.getItem(DEFAULT_STORAGE_KEY)).toBe(null)
    expect(document.documentElement.dataset.theme).toBe('slate-dark')
  })

  it('useTheme с persist=false хранилище не трогает', () => {
    const { setMode } = useTheme({ storageKey: 'app-theme', persist: false })
    setMode('dark')

    expect(window.localStorage.getItem('app-theme')).toBe(null)
    expect(document.documentElement.dataset.theme).toBe('slate-dark')
  })

  it('useTheme не бросает, если у localStorage нет setItem', () => {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: () => null,
      },
      configurable: true,
    })

    const { setMode } = useTheme({ storageKey: 'app-theme' })
    expect(() => setMode('dark')).not.toThrow()
    expect(document.documentElement.dataset.theme).toBe('slate-dark')
  })
})

describe('useTheme — режимы манифеста', () => {
  beforeEach(resetThemeEnvironment)

  function mountWith(options: UseThemeOptions) {
    let api: ReturnType<typeof useTheme> | null = null
    const wrapper = mount(defineComponent({
      setup() {
        api = useTheme()
        return () => null
      },
    }), { global: { plugins: [[granularityThemePlugin, options]] } })

    return { wrapper, api: api! }
  }

  it('тема и режимы — из манифеста; isDark по colorScheme, а не по имени', () => {
    const { wrapper, api } = mountWith({ manifest: OCEAN_MANIFEST })

    expect(api.theme.value).toBe('clay')
    expect(api.modes.map(entry => entry.name)).toEqual(['light', 'ocean', 'dark'])
    expect(api.isDark.value).toBe(false)

    api.setMode('ocean')
    expect(api.mode.value).toBe('ocean')
    expect(api.isDark.value).toBe(true)
    expect(document.documentElement.getAttribute('data-look')).toBe('clay-ocean')
    expect(window.localStorage.getItem(DEFAULT_STORAGE_KEY)).toBe('ocean')

    wrapper.unmount()
  })

  /** Лист темы, вставленный контроллером, «загружается» по команде теста. */
  async function loadSheet(theme: string): Promise<void> {
    await Promise.resolve()
    document.head.querySelector(`link[data-granum-theme="${theme}"]`)?.dispatchEvent(new Event('load'))
  }

  it('setTheme: лист дополнительной темы, потом пара; ключ выбора — тема и режим', async () => {
    document.head.innerHTML = ''
    const { wrapper, api } = mountWith({ manifest: TWO_THEMES })
    expect(api.themes.map(entry => entry.id)).toEqual(['clay', 'paper'])
    api.setMode('dark')

    const switching = api.setTheme('paper')
    expect(document.documentElement.getAttribute('data-look')).toBe('clay-dark')
    await loadSheet('paper')
    await switching
    expect(api.theme.value).toBe('paper')
    expect(api.mode.value).toBe('dark')
    expect(api.modes.map(entry => entry.name)).toEqual(['light', 'dark'])
    expect(document.documentElement.getAttribute('data-look')).toBe('paper-dark')
    expect(window.localStorage.getItem(DEFAULT_STORAGE_KEY)).toBe('paper-dark')

    // Режима `ocean` у бумаги нет — первый той же схемы.
    await api.setTheme('clay', { mode: 'ocean' })
    expect(document.documentElement.getAttribute('data-look')).toBe('clay-ocean')
    expect(window.localStorage.getItem(DEFAULT_STORAGE_KEY)).toBe('ocean')
    await expect(api.setTheme('ink')).rejects.toThrow(/theme 'ink' is not in the build/)
    wrapper.unmount()
  })

  it('деструктуризация не теряет смену темы: theme — ref, modes — массив, который меняется на месте', async () => {
    document.head.innerHTML = ''
    const { wrapper, api } = mountWith({ manifest: TWO_THEMES })
    const { theme, modes, setTheme } = api
    const pairs = computed(() => modes.map(entry => entry.value).join(','))
    expect(pairs.value).toBe('clay-light,clay-ocean,clay-dark')

    const switching = setTheme('paper')
    await loadSheet('paper')
    await switching
    expect(theme.value).toBe('paper')
    expect(modes.map(entry => entry.name)).toEqual(['light', 'dark'])
    expect(pairs.value).toBe('paper-light,paper-dark')
    wrapper.unmount()
  })

  it('initTheme ставит пару дополнительной темы — после её листа, который загрузчик находит, а не дублирует', async () => {
    document.head.innerHTML = ''
    const { wrapper, api } = mountWith({ manifest: TWO_THEMES })
    const switching = api.setTheme('paper', { mode: 'dark' })
    await loadSheet('paper')
    await switching

    document.documentElement.removeAttribute('data-look')
    api.initTheme()
    await Promise.resolve()
    await Promise.resolve()
    expect(document.documentElement.getAttribute('data-look')).toBe('paper-dark')
    expect(document.head.querySelectorAll('link[data-granum-theme]')).toHaveLength(1)
    wrapper.unmount()
  })

  it('initial — выбор темы и режима мимо хранилища: дополнительная тема встаёт после листа', async () => {
    document.head.innerHTML = ''
    window.localStorage.setItem(DEFAULT_STORAGE_KEY, 'light')
    const { wrapper, api } = mountWith({ manifest: TWO_THEMES, initial: { theme: 'paper', mode: 'dark' } })
    await loadSheet('paper')
    await Promise.resolve()
    expect(api.theme.value).toBe('paper')
    expect(api.mode.value).toBe('dark')
    expect(document.documentElement.getAttribute('data-look')).toBe('paper-dark')
    expect(window.localStorage.getItem(DEFAULT_STORAGE_KEY)).toBe('light')
    wrapper.unmount()
  })

  it('выбор дополнительной темы в другой вкладке переключает тему, не перезаписывая хранилище', async () => {
    document.head.innerHTML = ''
    const { wrapper, api } = mountWith({ manifest: TWO_THEMES })
    window.dispatchEvent(new StorageEvent('storage', { key: DEFAULT_STORAGE_KEY, newValue: 'paper-dark' }))
    await loadSheet('paper')
    await Promise.resolve()
    expect(api.theme.value).toBe('paper')
    expect(document.documentElement.getAttribute('data-look')).toBe('paper-dark')
    expect(window.localStorage.getItem(DEFAULT_STORAGE_KEY)).toBeNull()
    wrapper.unmount()
  })

  // Переключатель на своём контроллере granum или скрипт после подмены
  // документа меняет пару мимо состояния.
  it('пару сменил другой писатель — состояние идёт за корнем и не перебивает её', async () => {
    document.head.innerHTML = ''
    initThemeEarly({ manifest: OCEAN_MANIFEST })
    let api: ReturnType<typeof useTheme> | null = null
    const island = () => mount(defineComponent({
      setup() {
        api = useTheme()
        return () => null
      },
    }))
    const first = island()
    expect(api!.mode.value).toBe('light')

    document.documentElement.setAttribute('data-look', 'clay-dark')
    await Promise.resolve()
    expect(api!.mode.value).toBe('dark')

    const late = island()
    expect(document.documentElement.getAttribute('data-look')).toBe('clay-dark')
    // Чужая пара состоянию ничего не говорит.
    document.documentElement.setAttribute('data-look', 'nope')
    await Promise.resolve()
    expect(api!.mode.value).toBe('dark')

    late.unmount()
    first.unmount()
  })

  it('пара темы без листа состояние не переключает: её значения были бы чужими', async () => {
    const { href: _, ...paper } = TWO_THEMES.themes[1]
    const { wrapper, api } = mountWith({ manifest: { ...TWO_THEMES, themes: [TWO_THEMES.themes[0], paper] } })

    document.documentElement.setAttribute('data-look', 'paper-dark')
    await Promise.resolve()
    expect(api.theme.value).toBe('clay')
    wrapper.unmount()
  })

  it('toggleMode — между первым светлым и первым тёмным режимом', () => {
    const { wrapper, api } = mountWith({ manifest: OCEAN_MANIFEST })

    api.toggleMode()
    expect(api.mode.value).toBe('ocean')

    api.setMode('dark')
    api.toggleMode()
    expect(api.mode.value).toBe('light')

    wrapper.unmount()
  })

  it('режима нет в сборке — ошибка с набором режимов', () => {
    const { wrapper, api } = mountWith({ manifest: OCEAN_MANIFEST })

    expect(() => api.setMode('sepia')).toThrow(/light, ocean, dark/)
    expect(api.mode.value).toBe('light')

    wrapper.unmount()
  })

  it('системная схема меняет режим, пока выбор не сохранён, и сама не сохраняется', () => {
    let listener: ((event: MediaQueryListEvent) => void) | undefined
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
      matches: false,
      addEventListener: (_: string, handler: (event: MediaQueryListEvent) => void) => {
        listener = handler
      },
      removeEventListener: () => {},
    }))

    const { wrapper, api } = mountWith({ manifest: OCEAN_MANIFEST })
    listener!({ matches: true } as MediaQueryListEvent)

    expect(api.mode.value).toBe('ocean')
    expect(window.localStorage.getItem(DEFAULT_STORAGE_KEY)).toBe(null)

    api.setMode('light')
    listener!({ matches: true } as MediaQueryListEvent)
    expect(api.mode.value).toBe('light')

    wrapper.unmount()
  })

  it('своё хранилище (cookie) вместо localStorage', () => {
    const cookie = new Map<string, string>([['gr-theme', 'dark']])
    const storage = { getItem: (key: string) => cookie.get(key) ?? null, setItem: (key: string, value: string) => void cookie.set(key, value) }

    const { wrapper, api } = mountWith({ storage })
    expect(api.mode.value).toBe('dark')

    api.setMode('light')
    expect(cookie.get('gr-theme')).toBe('light')
    expect(window.localStorage.getItem(DEFAULT_STORAGE_KEY)).toBe(null)

    wrapper.unmount()
  })

  it('initial — режим мимо хранилища: так сервер отдаёт режим запроса', () => {
    window.localStorage.setItem(DEFAULT_STORAGE_KEY, 'light')

    const { wrapper, api } = mountWith({ initial: 'dark' })

    expect(api.mode.value).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('slate-dark')

    wrapper.unmount()
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

    first.api.setMode('dark')

    // Канонический фолбэк для SPA: `useTheme()` из любого места — одна тема.
    expect(second.api.mode.value).toBe('dark')
    expect(second.api.isDark.value).toBe(true)

    first.wrapper.unmount()
    second.wrapper.unmount()
  })

  it('с плагином у каждого приложения тема своя', () => {
    const first = mountWithTheme([granularityThemePlugin])
    const second = mountWithTheme([granularityThemePlugin])

    first.api.setMode('dark')
    second.api.setMode('light')

    // Иначе два независимых приложения на одной странице делили бы одну тему.
    expect(first.api.mode.value).toBe('dark')
    expect(second.api.mode.value).toBe('light')

    first.wrapper.unmount()
    second.wrapper.unmount()
  })

  it('плагин с `target` пишет тему в корень приложения, а не в documentElement', () => {
    const rootA = document.createElement('div')
    const rootB = document.createElement('div')
    document.body.append(rootA, rootB)

    const first = mountWithTheme([granularityThemePlugin, { target: () => rootA, persist: false }])
    const second = mountWithTheme([granularityThemePlugin, { target: () => rootB, persist: false }])

    first.api.setMode('dark')
    second.api.setMode('light')

    // Ради этого target и существует: темы приложений не перетирают друг друга.
    expect(rootA.dataset.theme).toBe('slate-dark')
    expect(rootB.dataset.theme).toBe('slate-light')
    expect(document.documentElement.dataset.theme).toBeUndefined()

    first.wrapper.unmount()
    second.wrapper.unmount()
    rootA.remove()
    rootB.remove()
  })

  it('app-scoped состояние идёт за парой своего `target`, а после unmount — нет', async () => {
    const root = document.createElement('div')
    document.body.append(root)
    const { wrapper, api } = mountWithTheme([granularityThemePlugin, { target: () => root, persist: false }])

    root.dataset.theme = 'slate-dark'
    await Promise.resolve()
    expect(api.mode.value).toBe('dark')

    wrapper.unmount()
    root.dataset.theme = 'slate-light'
    await Promise.resolve()
    expect(api.mode.value).toBe('dark')
    root.remove()
  })

  it('unmount приложения снимает window-слушатели app-scoped состояния', () => {
    const root = document.createElement('div')
    document.body.append(root)

    const { wrapper, api } = mountWithTheme([granularityThemePlugin, { storageKey: 'dead-theme', target: () => root }])
    expect(api.mode.value).toBe('light')

    wrapper.unmount()

    // Слушатель мёртвого приложения не должен ни менять состояние, ни трогать DOM.
    window.dispatchEvent(new StorageEvent('storage', { key: 'dead-theme', newValue: 'dark' }))

    expect(api.mode.value).toBe('light')
    expect(root.dataset.theme).toBe('slate-light')

    root.remove()
  })

  it('storage-событие другой вкладки применяет тему к `target`', () => {
    const root = document.createElement('div')
    document.body.append(root)

    const { wrapper, api } = mountWithTheme([granularityThemePlugin, { storageKey: 'scoped-theme', target: () => root }])

    window.dispatchEvent(new StorageEvent('storage', { key: 'scoped-theme', newValue: 'dark' }))

    expect(api.mode.value).toBe('dark')
    expect(root.dataset.theme).toBe('slate-dark')
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

    app.runWithContext(() => useTheme()).setMode('dark')

    expect(root.dataset.theme).toBe('slate-dark')
    expect(document.documentElement.dataset.theme).toBeUndefined()

    app.unmount()
    root.remove()
  })

  it('плагин принимает свои `storageKey` и `persist`', () => {
    const { wrapper, api } = mountWithTheme([granularityThemePlugin, { storageKey: 'admin-theme' }])

    api.setMode('dark')

    expect(window.localStorage.getItem('admin-theme')).toBe('dark')
    expect(window.localStorage.getItem(DEFAULT_STORAGE_KEY)).toBe(null)
    wrapper.unmount()
  })
})
