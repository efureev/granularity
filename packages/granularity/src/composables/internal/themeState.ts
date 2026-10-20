import type { GranumModeEntry, GranumThemeController, GranumThemeManifest, GranumThemeManifestEntry, GranumThemeSelectionInput, GranumThemeStorage } from '@feugene/granum/runtime'
import { carryThemeMode, findTheme } from '@feugene/granum/runtime'
import type { InjectionKey, Ref } from 'vue'
import { grThemeManifest } from '@feugene/granularity-tokens'
import { hasInjectionContext, inject } from 'vue'

/** Id темы сборки — основной или дополнительной. */
export type GrThemeId = string

/** Имя режима темы: `light`, `dark` или режим приложения из `modes.define`. */
export type GrModeName = string

/** Манифест режимов сборки — `virtual:granum/themes`. */
export type GrThemeManifest = GranumThemeManifest

/** Режим в манифесте: имя, `colorScheme` и пара активации. */
export type GrModeEntry = GranumModeEntry

/** Тема сборки в манифесте: режимы с парами, режим по умолчанию, адрес листа. */
export type GrThemeEntry = GranumThemeManifestEntry

/** Выбор по именам: без `theme` — основная тема, без `mode` — режим по умолчанию темы. */
export type GrThemeSelection = GranumThemeSelectionInput

/**
 * Тема и режим одного приложения: манифест сборки, текущие тема и режим и
 * контроллер granum, который грузит лист темы, выставляет пару и пишет выбор
 * в хранилище.
 *
 * Тип живёт здесь, а не в `useTheme.ts`: острову `GrConfigProvider` нужны
 * манифест и режим документа, а не сам композабл, — иначе контроллер со
 * слушателями уехал бы в чанк каждого компонента.
 */
export interface ThemeState {
  manifest: GrThemeManifest
  /** Текущая тема на корне. Общая на все вызовы `useTheme()` приложения, как и режим. */
  theme: Ref<GrThemeId>
  /** Общий на все вызовы `useTheme()` приложения — иначе потребители разъехались бы. */
  mode: Ref<GrModeName>
  /**
   * Режимы текущей темы — реактивный массив, который меняется на месте: так
   * `modes` из деструктуризации `useTheme()` следует за `setTheme`.
   */
  modes: GrModeEntry[]
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

/** Манифест приложения; без состояния — запасной. */
export function themeManifestOf(state: Pick<ThemeState, 'manifest'> | null): GrThemeManifest {
  return state?.manifest ?? fallbackThemeManifest()
}

/** Текущая тема приложения в манифесте; без состояния — основная. */
export function currentThemeEntry(state: Pick<ThemeState, 'manifest' | 'theme'> | null): GrThemeEntry | undefined {
  const manifest = themeManifestOf(state)
  return findTheme(manifest, state?.theme.value) ?? findTheme(manifest)
}

/** Режим по имени: у текущей темы документа, иначе у любой темы сборки — ради его схемы. */
function modeNamed(state: Pick<ThemeState, 'manifest' | 'theme'> | null, name: GrModeName | undefined): GrModeEntry | undefined {
  if (name === undefined)
    return undefined
  return currentThemeEntry(state)?.modes.find(entry => entry.name === name)
    ?? themeManifestOf(state).themes.flatMap(entry => entry.modes).find(entry => entry.name === name)
}

/**
 * Режим острова в теме `theme`: `mode` острова, иначе режим документа — если он
 * у темы есть; иначе по правилу смены темы (`carryThemeMode`) — первый той же
 * схемы, иначе режим по умолчанию. Так остров `mode="ocean"` после
 * `setTheme('clay')` остаётся тёмным, а не получает пару, которой нет в CSS.
 */
export function islandMode(
  state: Pick<ThemeState, 'manifest' | 'mode' | 'theme'> | null,
  theme: GrThemeEntry,
  mode: GrModeName | undefined,
): GrModeEntry {
  const requested = mode ?? state?.mode.value
  return theme.modes.find(entry => entry.name === requested) ?? carryThemeMode(theme, modeNamed(state, requested))
}

/**
 * Атрибут активации поддерева: остров режима (`mode`) или темы (`theme`). Без
 * обоих — пусто, поддерево наследует корень.
 *
 * Пары тем сборки — из манифеста, режим — по {@link islandMode}. Пары темы,
 * которой нет в `themes` конфига granum, в CSS нет; тогда остаётся значение по
 * шаблону — для `themes/<id>.css`, подключённого без granum. Остров режима без
 * темы — в текущей теме документа.
 */
export function themeActivationAttrs(
  state: Pick<ThemeState, 'manifest' | 'mode' | 'theme'> | null,
  theme: GrThemeId | undefined,
  mode: GrModeName | undefined,
): Record<string, string> {
  if (theme === undefined && mode === undefined)
    return {}

  const manifest = themeManifestOf(state)
  const themeId = theme ?? currentThemeEntry(state)?.id ?? manifest.defaultTheme
  const target = findTheme(manifest, themeId)
  if (target)
    return { [manifest.activation.attribute]: islandMode(state, target, mode).value }

  const modeName = mode ?? state?.mode.value ?? findTheme(manifest)?.defaultMode ?? 'light'
  const template = manifest.activation.value ?? '{theme}-{mode}'
  return { [manifest.activation.attribute]: template.replaceAll('{theme}', themeId).replaceAll('{mode}', modeName) }
}
