import { computed, getCurrentInstance, inject, ref } from 'vue'
import type { App, InjectionKey, Ref } from 'vue'

export type ThemeName = 'light' | 'dark'

export type UseThemeOptions = {
  /**
   * Ключ для хранения выбранной темы в localStorage.
   * По умолчанию: `gr-theme`.
   */
  storageKey?: string

  /**
   * Если `false` — не читать/не писать localStorage (полезно для SSR/embedded сценариев).
   * По умолчанию: `true`.
   */
  persist?: boolean

  /**
   * Куда писать `data-theme`. По умолчанию — `<html>` (канон одного приложения).
   *
   * Геттер, а не элемент: на момент `app.use(...)` корень приложения ещё не
   * смонтирован. Обязателен нескольким приложениям с независимыми темами:
   * селектор тем атрибутный (`[data-theme='dark']`), поэтому тема работает от
   * любого контейнера, а без `target` все приложения писали бы в один `<html>`
   * и побеждал бы последний.
   */
  target?: () => HTMLElement | null
}

const DEFAULT_STORAGE_KEY = 'gr-theme'
const IS_SERVER = typeof window === 'undefined'

function readStoredTheme(storageKey: string, persist: boolean): ThemeName | null {
  if (typeof window === 'undefined' || !persist) return null

  // Доступ к `localStorage` может бросать `SecurityError` в Safari private mode
  // и при отключённых cookies/storage — поэтому оборачиваем в try/catch.
  try {
    const storage = window.localStorage
    if (typeof storage?.getItem !== 'function') return null

    const stored = storage.getItem(storageKey)
    if (stored === 'light' || stored === 'dark') return stored
  }
  catch {
    // ignore
  }

  return null
}

function getSystemTheme(): ThemeName {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light'
}

function getPreferredTheme(storageKey = DEFAULT_STORAGE_KEY, persist = true): ThemeName {
  return readStoredTheme(storageKey, persist) ?? getSystemTheme()
}

function applyTheme(theme: ThemeName, target?: () => HTMLElement | null) {
  if (typeof document === 'undefined') return

  // Канон GR — атрибут `[data-theme]`: на `<html>` (см. docs/styling.md →
  // «Темизация») либо на корне приложения, когда состояние задало `target`.
  // `useTheme`/`initThemeEarly` — единственный рантайм-API переключения темы.
  const root = target?.() ?? document.documentElement
  root.dataset.theme = theme
}

/**
 * Состояние темы одного приложения.
 *
 * `theme` общий для всех вызовов `useTheme()` внутри приложения: свой `ref` на
 * вызов означал бы, что переключение темы в одном компоненте не трогает
 * `theme`/`isDark` в другом — менялся бы только DOM-атрибут, а реактивные
 * потребители разъехались бы.
 */
type ThemeState = {
  theme: Ref<ThemeName>
  storageKey: string
  persist: boolean
  /** Корень, получающий `data-theme`; не задан — `<html>`. */
  target?: () => HTMLElement | null
  listenersBound: boolean
  /** Разрешена ли мутация — см. `resolveThemeState`. */
  writable: boolean
}

function createThemeState(options: UseThemeOptions = {}, writable = true): ThemeState {
  const storageKey = options.storageKey ?? DEFAULT_STORAGE_KEY
  const persist = options.persist ?? true

  return {
    theme: ref<ThemeName>(getPreferredTheme(storageKey, persist)),
    storageKey,
    persist,
    target: options.target,
    listenersBound: false,
    writable,
  }
}

/** Ключ provide/inject для app-scoped состояния темы (устанавливает плагин ниже). */
export const GRANULARITY_THEME_STATE: InjectionKey<ThemeState> = Symbol.for('@feugene/granularity/theme-state')

/**
 * Vue-плагин: даёт каждому приложению собственное состояние темы через
 * `app.provide`. Обязателен для (а) SSR, если приложение переключает тему на
 * сервере — иначе тема одного запроса уедет в ответ следующему, — и (б)
 * нескольких Vue-приложений на одной странице, которым нужны независимые темы.
 *
 * Для (б) обязателен и `target` — корень, получающий `data-theme`: без него
 * изолировано только состояние, а атрибут все приложения пишут в один `<html>`,
 * и побеждает последний.
 *
 * ```ts
 * app.use(granularityThemePlugin)
 * app.use(granularityThemePlugin, {
 *   storageKey: 'admin-theme',
 *   persist: false,
 *   target: () => document.getElementById('admin-app'),
 * })
 * ```
 */
export const granularityThemePlugin = {
  install(app: App, options: UseThemeOptions = {}) {
    app.provide(GRANULARITY_THEME_STATE, createThemeState(options))
  },
}

// Ленивый модульный синглтон — канонический фолбэк для простых SPA без плагина.
let moduleThemeState: ThemeState | null = null

function resolveThemeState(options: UseThemeOptions): ThemeState {
  // App-scoped состояние (provide через плагин) доступно только в setup-контексте.
  if (getCurrentInstance()) {
    const provided = inject(GRANULARITY_THEME_STATE, null)
    if (provided) return provided
  }

  // На сервере без плагина модульное состояние текло бы между запросами. Но
  // читать тему на сервере — нормальный сценарий (шаблон смотрит `isDark`), и
  // ронять на нём весь рендер нельзя: отдаём состояние на один вызов и запрещаем
  // мутацию — течёт именно она.
  if (IS_SERVER) return createThemeState(options, false)

  if (!moduleThemeState)
    moduleThemeState = createThemeState(options)

  return moduleThemeState
}

// Подписки на системную тему и синхронизацию между вкладками. Привязаны к
// состоянию, а не к модулю: у каждого приложения своё. Одна подписка на
// состояние, а не на потребителя, — `onScopeDispose` здесь был бы вреден, он
// порвал бы общую подписку при размонтировании одного из них.
function bindListeners(state: ThemeState) {
  if (state.listenersBound || typeof window === 'undefined') return
  state.listenersBound = true

  // Cross-tab: другая вкладка записала тему в localStorage.
  window.addEventListener?.('storage', (event: StorageEvent) => {
    if (!state.persist || event.key !== state.storageKey) return
    if (event.newValue === 'light' || event.newValue === 'dark') {
      state.theme.value = event.newValue
      applyTheme(event.newValue, state.target)
    }
  })

  // Системная смена `prefers-color-scheme` — следуем ей только если пользователь
  // НЕ выбрал тему явно (в storage ничего не сохранено).
  const mql = window.matchMedia?.('(prefers-color-scheme: dark)')
  mql?.addEventListener?.('change', (event: MediaQueryListEvent) => {
    if (readStoredTheme(state.storageKey, state.persist) !== null) return
    const next: ThemeName = event.matches ? 'dark' : 'light'
    state.theme.value = next
    applyTheme(next, state.target)
  })
}

/**
 * Для применения темы максимально рано (до монтирования Vue), чтобы избежать "мигания".
 * Также сидирует модульное состояние, чтобы значение в `useTheme()` совпадало с уже
 * применённым к документу.
 *
 * Функция клиентская: её зовут из браузерной точки входа до создания приложения,
 * то есть app-scoped состояние инжектить там ещё неоткуда. Расхождения с плагином
 * это не даёт — оба сидируются из одного `localStorage`.
 */
export function initThemeEarly(options: UseThemeOptions = {}) {
  const storageKey = options.storageKey ?? DEFAULT_STORAGE_KEY
  const persist = options.persist ?? true
  const preferred = getPreferredTheme(storageKey, persist)

  moduleThemeState ??= createThemeState(options)
  moduleThemeState.storageKey = storageKey
  moduleThemeState.persist = persist
  moduleThemeState.theme.value = preferred

  applyTheme(preferred)
}

export function useTheme(options: UseThemeOptions = {}) {
  const state = resolveThemeState(options)

  // Опции вызова уточняют состояние — тот же приём, что был у модульного
  // синглтона: слушателям нужно знать, какой ключ отслеживать.
  if (options.storageKey !== undefined) state.storageKey = options.storageKey
  if (options.persist !== undefined) state.persist = options.persist
  if (options.target !== undefined) state.target = options.target

  bindListeners(state)

  const theme = state.theme
  const isDark = computed(() => theme.value === 'dark')

  function setTheme(next: ThemeName) {
    if (!state.writable) {
      throw new Error(
        '[granularity] useTheme: setTheme/toggleTheme require `app.use(granularityThemePlugin)` during SSR — '
        + 'the module-singleton fallback is disabled server-side, so a theme set by one request would leak into '
        + 'the next response. Reading `theme`/`isDark` on the server works without the plugin.',
      )
    }

    theme.value = next
    applyTheme(next, state.target)

    if (state.persist && typeof window !== 'undefined') {
      // См. комментарий в `readStoredTheme`: запись тоже может бросать.
      try {
        const storage = window.localStorage
        if (typeof storage?.setItem === 'function')
          storage.setItem(state.storageKey, next)
      }
      catch {
        // ignore
      }
    }
  }

  function toggleTheme() {
    setTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  function initTheme() {
    applyTheme(theme.value, state.target)
  }

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme,
    initTheme,
  }
}
