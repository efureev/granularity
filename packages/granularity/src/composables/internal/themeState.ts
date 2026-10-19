import type { GranumModeEntry, GranumThemeController, GranumThemeManifest, GranumThemeStorage } from '@feugene/granum/runtime'
import { themeModeValue } from '@feugene/granum/runtime'
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
 * Пары активной темы и превью — из манифеста сборки. Пары превью, не
 * объявленного в `previews` конфига granum, в CSS нет; тогда остаётся
 * значение по шаблону — для `themes/<id>.css`, подключённого без granum. Превью
 * без режима показывает тему в режиме документа.
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
  const template = manifest.activation.value ?? '{theme}-{mode}'
  const value = themeModeValue(manifest, modeName, themeId)
    ?? template.replaceAll('{theme}', themeId).replaceAll('{mode}', modeName)

  return { [manifest.activation.attribute]: value }
}
