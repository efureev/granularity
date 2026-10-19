import type { GranumModeEntry, GranumThemeController, GranumThemeManifest, GranumThemeStorage } from '@feugene/granum/runtime'
import type { InjectionKey, Ref } from 'vue'
import { grThemeManifest } from '@feugene/granularity-tokens'
import { hasInjectionContext, inject } from 'vue'

/** Id темы каталога — тема сборки или превью. */
export type GrThemeId = string

/** Имя режима темы: `light`, `dark` или режим приложения из `modes.define`. */
export type GrModeName = string

/** Манифест режимов сборки — `virtual:granum/themes`. */
export type GrThemeManifest = GranumThemeManifest

/** Режим в манифесте: имя, `colorScheme` и пара активации. */
export type GrModeEntry = GranumModeEntry

/**
 * Режим одного приложения: манифест сборки, текущий режим и контроллер granum,
 * который выставляет пару и пишет выбор в хранилище.
 *
 * Тип живёт здесь, а не в `useTheme.ts`: острову `GrConfigProvider` нужны
 * манифест и режим документа, а не сам композабл, — иначе контроллер со
 * слушателями уехал бы в чанк каждого компонента.
 */
export interface ThemeState {
  manifest: GrThemeManifest
  /** Общий на все вызовы `useTheme()` приложения — иначе потребители разъехались бы. */
  mode: Ref<GrModeName>
  storageKey: string
  persist: boolean
  /** Своё хранилище вместо `localStorage` — cookie, которую видит сервер. */
  storage?: GranumThemeStorage
  /** Корень, получающий пару; не задан — `<html>`. */
  target?: () => HTMLElement | null
  /** На клиенте; сервер DOM не трогает и контроллера не заводит. */
  controller: GranumThemeController | null
  /** Смена режима, которую нельзя запоминать: системная схема, чужая вкладка. */
  silent: boolean
  listenersBound: boolean
  /**
   * Снимает window-слушатели состояния. Появляется после `bindListeners`;
   * зовёт `app.onUnmount` у app-scoped состояний — модульный синглтон живёт со
   * страницей, и снимать его незачем.
   */
  teardownListeners?: () => void
  /** Разрешена ли мутация — см. `resolveThemeState` в `useTheme.ts`. */
  writable: boolean
}

/** Ключ provide/inject для app-scoped состояния режима (ставит `granularityThemePlugin`). */
export const GRANULARITY_THEME_STATE: InjectionKey<ThemeState> = Symbol.for('@feugene/granularity/theme-state')

// Ленивый модульный синглтон — канонический фолбэк для простых SPA без плагина.
let moduleThemeState: ThemeState | null = null

export function getModuleThemeState(): ThemeState | null {
  return moduleThemeState
}

export function setModuleThemeState(state: ThemeState): void {
  moduleThemeState = state
}

let fallbackManifest: GrThemeManifest | null = null

/**
 * Манифест без `virtual:granum/themes`: тема каталога по умолчанию с режимами,
 * которые собраны в `@feugene/granularity/themes/<id>.css`.
 */
export function fallbackThemeManifest(): GrThemeManifest {
  fallbackManifest ??= grThemeManifest()
  return fallbackManifest
}

/** Состояние приложения, если оно уже есть, — без создания и без слушателей. */
export function peekThemeState(): ThemeState | null {
  if (hasInjectionContext()) {
    const provided = inject(GRANULARITY_THEME_STATE, null)
    if (provided)
      return provided
  }
  return moduleThemeState
}

/**
 * Атрибут активации поддерева: остров режима (`mode`) или превью темы
 * (`theme`). Без обоих — пусто, поддерево наследует корень.
 *
 * Пару активной темы берёт из манифеста; пару превью собирает правилом granum
 * по умолчанию `<тема>-<режим>` — в манифесте сборки её нет. Превью без режима
 * показывает тему в режиме документа.
 */
export function themeActivationAttrs(
  state: Pick<ThemeState, 'manifest' | 'mode'> | null,
  theme: GrThemeId | undefined,
  mode: GrModeName | undefined,
): Record<string, string> {
  if (theme === undefined && mode === undefined)
    return {}

  const manifest = state?.manifest ?? fallbackThemeManifest()
  const themeId = theme ?? manifest.theme.id
  const modeName = mode ?? state?.mode.value ?? manifest.defaultMode
  const own = themeId === manifest.theme.id
    ? manifest.modes.find(entry => entry.name === modeName)?.value
    : undefined

  return { [manifest.activation.attribute]: own ?? `${themeId}-${modeName}` }
}
