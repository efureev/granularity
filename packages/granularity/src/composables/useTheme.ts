import type { GranumThemeSelection, GranumThemeStorage, GranumThemeTarget } from '@feugene/granum/runtime'
import type { App, ComputedRef } from 'vue'
import { carryThemeMode, createThemeController, findTheme, isSelectableTheme, loadThemeSheet, readThemeSelection, resolveThemeActivation } from '@feugene/granum/runtime'
import { computed, hasInjectionContext, inject, ref, shallowReactive } from 'vue'

import {
  currentThemeEntry,
  fallbackThemeManifest,
  getModuleThemeState,
  GRANULARITY_THEME_STATE,
  type GrModeEntry,
  type GrModeName,
  type GrThemeEntry,
  type GrThemeId,
  type GrThemeManifest,
  type GrThemeSelection,
  setModuleThemeState,
  type ThemeState,
} from './internal/themeState'

export { GRANULARITY_THEME_STATE }
export type { GrModeEntry, GrModeName, GrThemeEntry, GrThemeId, GrThemeManifest, GrThemeSelection }

/**
 * Ключ хранилища выбора по умолчанию. Значение — не пара, а ключ выбора granum:
 * у основной темы имя режима (`dark`), у дополнительной — `<тема>-<режим>`.
 */
export const GR_THEME_STORAGE_KEY = 'gr-theme'

export type UseThemeOptions = {
  /**
   * Манифест режимов сборки — `import manifest from 'virtual:granum/themes'`.
   * Без него — тема каталога по умолчанию (`slate`) с режимами `light`/`dark`,
   * как в готовом `@feugene/granularity/themes/<id>.css`. Приложение на granum
   * с другой темой или своими режимами обязано его передать: пары чужой темы в
   * его CSS не совпадут ни с одним селектором.
   *
   * Задаётся там, где создаётся состояние, — `granularityThemePlugin`,
   * `initThemeEarly` или первый `useTheme()` без плагина.
   */
  manifest?: GrThemeManifest

  /** Ключ хранилища. По умолчанию `gr-theme`. */
  storageKey?: string

  /**
   * Если `false` — выбор не читается и не запоминается (SSR/embedded).
   * По умолчанию `true`.
   */
  persist?: boolean

  /**
   * Хранилище вместо `localStorage` — например `createCookieStorage()` из
   * `@feugene/granum/runtime`: режим из cookie сервер отдаёт парой в HTML.
   */
  storage?: GranumThemeStorage

  /**
   * Выбор на старте мимо хранилища и системной схемы: имя режима основной темы
   * или `{ theme?, mode? }`. Нужен серверу: выбор запроса —
   * `themeFromCookie(manifest, request.headers.cookie, 'gr-theme')`, и тема в нём
   * обязательна — по ней компоненты берут пропсы по умолчанию, и без неё
   * серверный HTML разошёлся бы с гидрацией.
   */
  initial?: GrModeName | GrThemeSelection

  /**
   * Куда писать пару. По умолчанию — `<html>` (канон одного приложения).
   *
   * Геттер, а не элемент: на момент `app.use(...)` корень приложения ещё не
   * смонтирован. Обязателен нескольким приложениям с независимыми режимами:
   * селектор режима атрибутный (`[data-theme="slate-dark"]`), поэтому режим работает от
   * любого контейнера, а без `target` все приложения писали бы в один `<html>`
   * и побеждал бы последний.
   */
  target?: () => HTMLElement | null
}

const IS_SERVER = typeof window === 'undefined'

function rootOf(state: ThemeState): HTMLElement | null {
  return state.target?.() ?? (typeof document === 'undefined' ? null : document.documentElement)
}

// Доступ к `localStorage` бросает в Safari private mode и при отключённых
// cookies/storage, а заглушка окружения может не иметь методов.
function storageOf(state: ThemeState): Partial<GranumThemeStorage> | null {
  try {
    return state.storage ?? window.localStorage ?? null
  }
  catch {
    return null
  }
}

function readStored(state: ThemeState): string | null {
  if (!state.persist)
    return null
  try {
    return storageOf(state)?.getItem?.(state.storageKey) ?? null
  }
  catch {
    return null
  }
}

function writeStored(state: ThemeState, key: string): void {
  if (!state.persist)
    return
  try {
    storageOf(state)?.setItem?.(state.storageKey, key)
  }
  catch {
    // ignore
  }
}

/** Режим текущей темы по имени. */
function modeEntry(state: ThemeState, name: GrModeName): GrModeEntry | undefined {
  return currentThemeEntry(state)?.modes.find(entry => entry.name === name)
}

function selectable(state: ThemeState) {
  return (theme: GrThemeEntry): boolean => isSelectableTheme(state.manifest, theme)
}

/** Тема и режим в состоянии; режимы меняются на месте — их держит и деструктуризация `useTheme()`. */
function select(state: ThemeState, theme: GrThemeEntry, mode: GrModeName): void {
  if (state.theme.value !== theme.id || state.modes.length === 0)
    state.modes.splice(0, state.modes.length, ...theme.modes)
  state.theme.value = theme.id
  state.mode.value = mode
}

function unknownTheme(manifest: GrThemeManifest, id: GrThemeId): Error {
  return new Error(`[granularity] useTheme: theme '${id}' is not in the build. Themes: ${manifest.themes.map(entry => entry.id).join(', ')}.`)
}

/**
 * Выбор `initial` — по правилу контроллера granum, чтобы сервер (где
 * контроллера нет) и клиент начинали одинаково: тема или режим не из сборки —
 * ошибка, без режима — режим по умолчанию темы.
 */
function initialSelection(manifest: GrThemeManifest, initial: GrModeName | GrThemeSelection | undefined): { theme: GrThemeEntry, mode: GrModeName } {
  const choice = typeof initial === 'string' ? { mode: initial } : initial ?? {}
  const theme = findTheme(manifest, choice.theme ?? manifest.defaultTheme)
  if (!theme)
    throw unknownTheme(manifest, choice.theme ?? manifest.defaultTheme)
  return { theme, mode: carryThemeMode(theme, undefined, choice.mode ?? theme.defaultMode).name }
}

/**
 * Контроллер granum над состоянием: пара на корне, запись выбора, чтение пары
 * обратно (RT-5). Цель и хранилище — посредники, а не элемент и `localStorage`:
 * корень приложения появляется после `app.use`, а `storageKey`/`persist`
 * уточняет вызов `useTheme(options)`.
 */
function connect(state: ThemeState, initial: GrModeName | GrThemeSelection | undefined): void {
  const target: GranumThemeTarget = {
    getAttribute: name => rootOf(state)?.getAttribute(name) ?? null,
    setAttribute: (name, value) => rootOf(state)?.setAttribute(name, value),
  }

  const controller = createThemeController(state.manifest, {
    target,
    storage: {
      getItem: () => readStored(state),
      setItem: (_key, value) => writeStored(state, value),
    },
    storageKey: state.storageKey,
    initial: initial ?? 'auto',
    prefersDark: () => window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false,
  })

  state.controller = controller
  select(state, controller.theme, controller.mode)
  controller.subscribe(next => select(state, controller.theme, next.mode))
}

function createThemeState(options: UseThemeOptions = {}, writable = true): ThemeState {
  const manifest = options.manifest ?? fallbackThemeManifest()
  const initial = initialSelection(manifest, options.initial)
  const state: ThemeState = {
    manifest,
    theme: ref(initial.theme.id),
    mode: ref(initial.mode),
    modes: shallowReactive([...initial.theme.modes]),
    storageKey: options.storageKey ?? GR_THEME_STORAGE_KEY,
    persist: options.persist ?? true,
    storage: options.storage,
    target: options.target,
    controller: null,
    listenersBound: false,
    writable,
  }

  if (!IS_SERVER)
    connect(state, options.initial)

  return state
}

/** Смена режима, которую нельзя запоминать: иначе система или соседняя вкладка решили бы за пользователя. */
function applySilently(state: ThemeState, mode: GrModeName): void {
  state.controller?.setMode(mode, { persist: false })
}

/**
 * Vue-плагин: даёт каждому приложению собственное состояние режима через
 * `app.provide`. Обязателен для (а) SSR, если приложение выбирает режим на
 * сервере, — иначе режим одного запроса уедет в ответ следующему, — и (б)
 * нескольких Vue-приложений на одной странице, которым нужны независимые режимы.
 *
 * Для (б) обязателен и `target` — корень, получающий `data-theme`: без него
 * атрибут все приложения пишут в один `<html>`, а их состояния идут за ним —
 * выбор одного доходит до остальных.
 *
 * ```ts
 * import manifest from 'virtual:granum/themes'
 *
 * app.use(granularityThemePlugin, { manifest })
 * app.use(granularityThemePlugin, {
 *   manifest,
 *   storageKey: 'admin-theme',
 *   target: () => document.getElementById('admin-app'),
 * })
 * ```
 */
// Где-то на странице установлен плагин: фолбэк в синглтон для такого приложения —
// почти наверняка ошибка вызова, а не осознанный выбор.
let appScopedThemeProvided = false
let contextFallbackWarned = false

export const granularityThemePlugin = {
  install(app: App, options: UseThemeOptions = {}) {
    appScopedThemeProvided = true
    const state = createThemeState(options)
    app.provide(GRANULARITY_THEME_STATE, state)
    // Слушатели `storage`/`prefers-color-scheme` держат состояние; без снятия
    // каждый цикл mount/unmount микрофронтенда копил бы их на window навсегда.
    app.onUnmount(() => state.teardownListeners?.())
  },
}

/** Сброс dev-предупреждения о фолбэке. Внутреннее API — нужно тестам. */
export function resetThemeContextWarning(): void {
  contextFallbackWarned = false
}

function resolveThemeState(options: UseThemeOptions): ThemeState {
  // App-scoped состояние (provide через плагин): setup-контекст ИЛИ
  // `app.runWithContext(() => useTheme())` — `hasInjectionContext` покрывает оба.
  if (hasInjectionContext()) {
    const provided = inject(GRANULARITY_THEME_STATE, null)
    if (provided)
      return provided
  }

  // На сервере без плагина модульное состояние текло бы между запросами. Но
  // читать режим на сервере — нормальный сценарий (шаблон смотрит `isDark`), и
  // ронять на нём весь рендер нельзя: отдаём состояние на один вызов и запрещаем
  // мутацию — течёт именно она.
  if (IS_SERVER)
    return createThemeState(options, false)

  // Дедуп и текст — прямо под гардом: `__GR_DEV__` разворачивается в условие
  // на сборке, и у потребителя вся ветка выкидывается вместе с сообщением.
  if (
    appScopedThemeProvided && !contextFallbackWarned
    && __GR_DEV__
  ) {
    contextFallbackWarned = true
    console.warn(
      '[granularity] useTheme() вызван вне setup/inject-контекста: app-scoped состояние '
      + 'granularityThemePlugin недоступно, использован модульный синглтон. '
      + 'Оберните вызов: app.runWithContext(() => useTheme()).',
    )
  }

  let state = getModuleThemeState()
  if (!state) {
    state = createThemeState(options)
    setModuleThemeState(state)
  }

  return state
}

// Подписки на системную схему и синхронизацию между вкладками. Привязаны к
// состоянию, а не к модулю: у каждого приложения своё. Одна подписка на
// состояние, а не на потребителя, — `onScopeDispose` здесь был бы вреден, он
// порвал бы общую подписку при размонтировании одного из них.
function bindListeners(state: ThemeState) {
  if (state.listenersBound || typeof window === 'undefined')
    return
  state.listenersBound = true

  // Cross-tab: другая вкладка записала режим в localStorage. Своё хранилище
  // (cookie) событий `storage` не порождает.
  const onStorage = (event: StorageEvent): void => {
    if (!state.persist || state.storage || event.key !== state.storageKey)
      return
    const next = readThemeSelection(state.manifest, event.newValue, selectable(state))
    if (next)
      followSelection(state, next)
  }
  window.addEventListener?.('storage', onStorage)

  // Системная смена `prefers-color-scheme` — следуем ей только если пользователь
  // НЕ выбрал режим явно (в хранилище ничего нет).
  const mql = window.matchMedia?.('(prefers-color-scheme: dark)')
  const onSchemeChange = (event: MediaQueryListEvent): void => {
    if (readStored(state) !== null)
      return
    const scheme = event.matches ? 'dark' : 'light'
    const next = currentThemeEntry(state)?.modes.find(entry => entry.colorScheme === scheme)
    if (next)
      applySilently(state, next.name)
  }
  mql?.addEventListener?.('change', onSchemeChange)

  state.teardownListeners = () => {
    window.removeEventListener?.('storage', onStorage)
    mql?.removeEventListener?.('change', onSchemeChange)
    state.rootObserver?.observer.disconnect()
    state.rootObserver = undefined
    state.listenersBound = false
    state.teardownListeners = undefined
  }
}

/** Выбор, сделанный не этим состоянием, — без записи в хранилище. */
function followSelection(state: ThemeState, next: GranumThemeSelection): void {
  if (next.theme.id === state.theme.value)
    applySilently(state, next.mode.name)
  else
    void state.controller?.setTheme(next.theme.id, { mode: next.mode.name, persist: false }).catch(() => {})
}

/**
 * Пару на корне ставит не только это состояние: переключатель на своём
 * контроллере granum, скрипт до первого кадра после подмены документа
 * (`astro:after-swap`). Состояние идёт за корнем — иначе следующий `useTheme()`
 * вернул бы на корень устаревший выбор. Корень берётся на каждый `useTheme()`:
 * `target` приложения может появиться или смениться позже привязки слушателей.
 */
function observeRoot(state: ThemeState): void {
  if (!state.listenersBound || typeof MutationObserver === 'undefined')
    return
  const root = rootOf(state)
  if (state.rootObserver?.root === root)
    return
  state.rootObserver?.observer.disconnect()
  state.rootObserver = undefined
  if (!root)
    return
  const attribute = state.manifest.activation.attribute
  const observer = new MutationObserver(() => {
    const next = resolveThemeActivation(state.manifest, root.getAttribute(attribute))
    if (!next || !isSelectableTheme(state.manifest, next.theme))
      return
    if (next.theme.id !== state.theme.value || next.mode.name !== state.mode.value)
      followSelection(state, next)
  })
  observer.observe(root, { attributes: true, attributeFilter: [attribute] })
  state.rootObserver = { root, observer }
}

/**
 * Пара текущего режима на корне — без записи в хранилище. Пара дополнительной
 * темы — только после её листа: без него значения были бы чужими. Загрузчик
 * находит уже вставленный лист и второй не ставит.
 */
function applyToRoot(state: ThemeState): void {
  const entry = modeEntry(state, state.mode.value)
  if (!entry)
    return
  const theme = state.theme.value
  const apply = (): void => {
    const root = rootOf(state)
    // Пока грузился лист, выбор мог смениться — тогда пару ставит новый выбор.
    if (state.theme.value !== theme || state.mode.value !== entry.name)
      return
    if (root && root.getAttribute(state.manifest.activation.attribute) !== entry.value)
      root.setAttribute(state.manifest.activation.attribute, entry.value)
  }
  if (theme === state.manifest.defaultTheme)
    apply()
  else
    loadThemeSheet(state.manifest, theme).then(apply, () => {})
}

/**
 * Ставит пару до монтирования Vue, чтобы не было «мигания», и сидирует
 * модульное состояние: `useTheme()` отдаёт то, что уже на документе.
 *
 * Пара, уже стоящая на корне (серверный HTML, скрипт в `<head>`), побеждает
 * хранилище — контроллер её только узнаёт. Функция клиентская: её зовут из
 * браузерной точки входа до создания приложения, то есть app-scoped состояние
 * инжектить там ещё неоткуда. Расхождения с плагином это не даёт — оба
 * читают одно хранилище и одну пару.
 */
export function initThemeEarly(options: UseThemeOptions = {}) {
  if (IS_SERVER)
    return

  getModuleThemeState()?.teardownListeners?.()
  setModuleThemeState(createThemeState(options))
}

export interface UseThemeReturn {
  /** Текущая тема на корне: меняется `setTheme` и выбором в другой вкладке. */
  readonly theme: ComputedRef<GrThemeId>
  /** Темы сборки: основная и дополнительные с адресами листов. */
  readonly themes: readonly GrThemeEntry[]
  readonly mode: ComputedRef<GrModeName>
  /**
   * Режимы текущей темы: имя, `colorScheme` и пара активации. Реактивный
   * массив, который `setTheme` меняет на месте, — деструктуризация его не теряет.
   */
  readonly modes: readonly GrModeEntry[]
  /** По `colorScheme` режима, а не по имени. */
  readonly isDark: ComputedRef<boolean>
  /** Режима нет у текущей темы — ошибка. */
  setMode: (next: GrModeName) => void
  /**
   * Переключить тему: лист дополнительной темы загружается, потом ставится пара.
   * Режим — `mode`, иначе одноимённый текущему, иначе той же схемы, иначе режим
   * по умолчанию темы. Темы нет в сборке — ошибка.
   */
  setTheme: (next: GrThemeId, options?: { readonly mode?: GrModeName }) => Promise<void>
  /** Между первым светлым и первым тёмным режимом манифеста. */
  toggleMode: () => void
  /** Пара текущего режима на корне — без записи в хранилище. */
  initTheme: () => void
}

export function useTheme(options: UseThemeOptions = {}): UseThemeReturn {
  const state = resolveThemeState(options)

  // Опции вызова уточняют состояние: слушателям нужно знать, какой ключ
  // отслеживать. Манифест — нет: он задаётся там, где состояние создаётся.
  if (options.storageKey !== undefined)
    state.storageKey = options.storageKey
  if (options.persist !== undefined)
    state.persist = options.persist
  if (options.target !== undefined)
    state.target = options.target

  bindListeners(state)
  observeRoot(state)
  if (state.controller)
    applyToRoot(state)

  const theme = computed(() => state.theme.value)
  const mode = computed(() => state.mode.value)
  const isDark = computed(() => modeEntry(state, state.mode.value)?.colorScheme === 'dark')

  function assertWritable(): void {
    if (!state.writable) {
      throw new Error(
        '[granularity] useTheme: setMode/setTheme/toggleMode require `app.use(granularityThemePlugin)` during SSR — '
        + 'the module-singleton fallback is disabled server-side, so a choice made by one request would leak into '
        + 'the next response. Reading `theme`/`mode`/`isDark` on the server works without the plugin.',
      )
    }
  }

  function setMode(next: GrModeName) {
    assertWritable()

    if (state.controller) {
      state.controller.setMode(next)
      return
    }

    if (!modeEntry(state, next)) {
      throw new Error(
        `[granularity] useTheme: mode '${next}' is not in the build of theme '${state.theme.value}'. `
        + `Available: ${currentThemeEntry(state)?.modes.map(entry => entry.name).join(', ') ?? '—'}.`,
      )
    }
    state.mode.value = next
  }

  // Не `async`: запрет записи без плагина — синхронная ошибка, как у `setMode`,
  // а не отклонённый промис, который на сервере никто не ждёт.
  function setTheme(next: GrThemeId, setOptions: { readonly mode?: GrModeName } = {}): Promise<void> {
    assertWritable()

    if (state.controller)
      return state.controller.setTheme(next, setOptions.mode !== undefined ? { mode: setOptions.mode } : {})

    // Сервер с плагином: тема и режим запроса — без DOM и без листов, по правилу контроллера.
    try {
      const theme = findTheme(state.manifest, next)
      if (!theme)
        throw unknownTheme(state.manifest, next)
      select(state, theme, carryThemeMode(theme, modeEntry(state, state.mode.value), setOptions.mode).name)
      return Promise.resolve()
    }
    catch (error) {
      return Promise.reject(error)
    }
  }

  function toggleMode() {
    const scheme = modeEntry(state, state.mode.value)?.colorScheme
    const next = currentThemeEntry(state)?.modes.find(entry => entry.colorScheme !== scheme)
    if (next)
      setMode(next.name)
  }

  function initTheme() {
    applyToRoot(state)
  }

  return {
    theme,
    themes: state.manifest.themes,
    mode,
    modes: state.modes,
    isDark,
    setMode,
    setTheme,
    toggleMode,
    initTheme,
  }
}
