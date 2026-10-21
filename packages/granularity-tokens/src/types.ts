/**
 * Типы пакета токенов. Данные генерируются (`generated.ts`), типы — нет:
 * контракт описывает человек, значения — генератор.
 */

/** Примитив реестра: значение от режима не зависит и задаётся в `root` темы. */
export interface GrFoundationToken {
  /** Полное имя CSS custom property, включая `--`. */
  name: string
  /** Заголовок группы, в которой токен объявлен (`Typography: font sizes`). */
  section: string
  description: string
}

/** Роль реестра: значение задаёт каждый режим темы. */
export interface GrRoleToken {
  name: string
  section: string
  description: string
}

/**
 * Производное состояние: в CSS живёт формулой `color-mix`, для браузеров без
 * неё тема несёт посчитанный фолбэк (`GrModeData.fallbacks`).
 */
export interface GrDerivedToken {
  name: string
  section: string
  description: string
  formula: string
  /** Слагаемые формулы отдельно от её текста: по ним считается фолбэк. */
  base: string
  amount: number
  mixWith: string
}

/** Словарь токенов: из него тема проверяется на полноту. */
export interface GrRegistry {
  foundation: readonly GrFoundationToken[]
  roles: readonly GrRoleToken[]
  derived: readonly GrDerivedToken[]
}

export type GrColorScheme = 'light' | 'dark'

export interface GrModeFallback {
  /** Условие `@supports`, под которым фолбэк действует. */
  supports: string
  tokens: Readonly<Record<string, string>>
}

/**
 * Режим темы — структурно `GranumModeData` контракта granum 3. Ключи токенов —
 * без `--`; при `extends` — только отличия от режима-предка.
 */
export interface GrModeData {
  title?: string
  colorScheme: GrColorScheme
  extends?: string
  tokens: Readonly<Record<string, string>>
  fallbacks?: readonly GrModeFallback[]
}

/**
 * Данные темы — структурно `GranumThemeData` контракта granum 3: значения без
 * селекторов, их назначает сборка приложения. Наследование темы от темы уже
 * разрешено — в данных его нет.
 */
export interface GrThemeData {
  id: string
  title: string
  description?: string
  /** Абсолютный URL дизайн-системы темы. */
  docs?: string
  /** Версия темы — своя, не версия пакета, в котором она лежит. */
  version?: string
  /** Пакеты компонентов, под версии которых тема написана: `{ <пакет>: <диапазон semver> }`. */
  targets?: Readonly<Record<string, string>>
  root: Readonly<Record<string, string>>
  modes: Readonly<Record<string, GrModeData>>
  defaultMode?: string
  baseCss?: readonly string[]
  /** Значения токенов компонентов: пакет → компонент → `root` и режимы. */
  components?: GrThemeComponents
  extensions?: Readonly<Record<string, unknown>>
}

/** Значения токенов одного компонента в теме. Ключи — без `--`. */
export interface GrThemeComponentValues {
  root?: Readonly<Record<string, string>>
  modes?: Readonly<Record<string, Readonly<Record<string, string>>>>
}

/** Раздел `components` темы — структурно раздел `components` данных темы granum. */
export type GrThemeComponents = Readonly<Record<string, Readonly<Record<string, GrThemeComponentValues>>>>

/** Режим в каталоге: метаданные без значений. */
export interface GrCatalogMode {
  name: string
  title?: string
  colorScheme: GrColorScheme
}

/** Тема в каталоге пакета: то, что нужно списку тем, без значений токенов. */
export interface GrThemeCatalogEntry {
  id: string
  title: string
  description?: string
  docs?: string
  version?: string
  targets?: Readonly<Record<string, string>>
  extends?: string
  defaultMode: string
  modes: readonly GrCatalogMode[]
}
