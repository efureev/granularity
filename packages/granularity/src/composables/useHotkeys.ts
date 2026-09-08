import type { App, InjectionKey } from 'vue'
import { computed, hasInjectionContext, inject, reactive } from 'vue'

/**
 * Реестр горячих клавиш приложения: один источник «id → сочетание + подпись».
 *
 * Без него сочетание пишется дважды — в привязке (`v-hotkey`) и в подсказке
 * (`GrKbd`), — и расходится молча: подсказка обещает одно, а срабатывает другое,
 * и заметить это можно только руками.
 *
 * Реестр объявляет **умолчания приложения**. Пользовательские переопределения —
 * состояние приложения, и жить им здесь незачем: кит про них ничего не знает.
 */

export interface GrHotkeyDefinition {
  /**
   * Сочетание в общем синтаксисе пакета: `'mod+k'` — аккорд, `'g i'` —
   * «G, затем I». Разбор — `parseHotkeySequence`.
   */
  keys: string
  /** Человекочитаемое имя действия: для подсказок и списка сочетаний. */
  label?: string
}

export type GrHotkeyRegistry = Record<string, GrHotkeyDefinition>

interface HotkeysState {
  hotkeys: GrHotkeyRegistry
}

export interface GranularityHotkeysPluginOptions {
  hotkeys?: GrHotkeyRegistry
}

function createHotkeysState(hotkeys: GrHotkeyRegistry = {}): HotkeysState {
  return reactive<HotkeysState>({ hotkeys: { ...hotkeys } })
}

/** Ключ provide/inject для app-scoped реестра (устанавливает плагин ниже). */
export const GRANULARITY_HOTKEYS_STATE: InjectionKey<HotkeysState>
  = Symbol.for('@feugene/granularity/hotkeys-state')

/**
 * Vue-плагин: даёт каждому приложению собственный реестр через `app.provide`.
 * Обязателен там же, где и у тостов: несколько приложений на странице делили бы
 * один реестр, а на сервере модульное состояние текло бы между запросами.
 *
 * ```ts
 * app.use(granularityHotkeysPlugin, {
 *   hotkeys: {
 *     'search.open': { keys: 'mod+k', label: 'Открыть поиск' },
 *     'issues.goto': { keys: 'g i', label: 'Перейти к задачам' },
 *   },
 * })
 * ```
 */
let appScopedHotkeysProvided = false
let contextFallbackWarned = false

export const granularityHotkeysPlugin = {
  install(app: App, options: GranularityHotkeysPluginOptions = {}) {
    appScopedHotkeysProvided = true
    app.provide(GRANULARITY_HOTKEYS_STATE, createHotkeysState(options.hotkeys))
  },
}

let moduleHotkeysState: HotkeysState | null = null

/** Сброс модульного реестра и dev-предупреждения. Внутреннее API — нужно тестам. */
export function resetHotkeysRegistry(): void {
  moduleHotkeysState = null
  contextFallbackWarned = false
}

function resolveHotkeysState(): HotkeysState {
  if (hasInjectionContext()) {
    const provided = inject(GRANULARITY_HOTKEYS_STATE, null)
    if (provided)
      return provided
  }

  if (appScopedHotkeysProvided && !contextFallbackWarned && __GR_DEV__) {
    contextFallbackWarned = true
    console.warn(
      '[granularity] useHotkeys() вызван вне setup/inject-контекста: app-scoped реестр '
      + 'granularityHotkeysPlugin недоступен, использован модульный. Оберните вызов: '
      + 'app.runWithContext(() => useHotkeys()).',
    )
  }

  if (!moduleHotkeysState)
    moduleHotkeysState = createHotkeysState()

  return moduleHotkeysState
}

const warnedIds = new Set<string>()

export function useHotkeys() {
  const state = resolveHotkeysState()

  /**
   * Неизвестный id — предупреждение, а не тишина. Молча вернув `undefined`, мы
   * получили бы исчезнувшую подсказку и непривязанный хоткей: оба симптома
   * выглядят как «забыли сделать», и искать причину пришлось бы в чужом коде.
   */
  function get(id: string): GrHotkeyDefinition | undefined {
    const definition = state.hotkeys[id]

    if (!definition && __GR_DEV__ && !warnedIds.has(id)) {
      warnedIds.add(id)
      console.warn(`[granularity] useHotkeys: сочетания с id "${id}" в реестре нет.`)
    }

    return definition
  }

  function register(id: string, definition: GrHotkeyDefinition): void {
    state.hotkeys[id] = definition
    warnedIds.delete(id)
  }

  /**
   * Разворачивает `{ id: обработчик }` в карту для `v-hotkey`. Директива про
   * реестр так и не узнаёт — сочетание приезжает к ней строкой, как и раньше, —
   * а источник у привязки и подсказки остаётся один.
   */
  function byHotkeyId(map: Record<string, unknown>): Record<string, any> {
    const result: Record<string, any> = {}

    for (const [id, handler] of Object.entries(map)) {
      const keys = get(id)?.keys
      if (keys)
        result[keys] = handler
    }

    return result
  }

  return {
    hotkeys: computed(() => state.hotkeys),
    get,
    register,
    byHotkeyId,
    keysOf: (id: string) => get(id)?.keys,
    labelOf: (id: string) => get(id)?.label,
  }
}
