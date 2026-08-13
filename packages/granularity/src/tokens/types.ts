/**
 * Типы справочника токенов. Данные генерируются (`generated.ts`), типы — нет:
 * контракт описывает человек, значения — генератор.
 */

/** Имя темы, объявленной в `tokens/themes/*.json`. */
export type GrThemeName = 'light' | 'dark'

/** Значение токена в каждой теме. */
export type GrTokenValues = Record<GrThemeName, string>

/** Примитив: не зависит от темы, живёт в `:root`. */
export interface GrFoundationToken {
  /** Полное имя CSS custom property, включая `--`. */
  name: string
  value: string
  /** Заголовок группы, в которой токен объявлен (`Typography: font sizes`). */
  section: string
  description: string
}

/** Семантическая роль: своё значение в каждой теме. */
export interface GrThemeToken {
  name: string
  section: string
  description: string | null
  values: GrTokenValues
}

/**
 * Природа покомпонентного токена — она же отвечает на вопрос, что будет, если
 * его не задать: `theme`/`css`/`inline` компонент присваивает сам, `hook` не
 * присваивается нигде и работает дефолтом из `var(--gr-x, дефолт)`.
 */
export type GrComponentTokenKind = 'theme' | 'css' | 'inline' | 'hook'

/**
 * Точка кастомизации отдельного компонента. Источник — `tokens.json` рядом с
 * его кодом; в CSS отсюда ничего не генерируется.
 */
export interface GrComponentToken {
  /** Компонент-владелец (`GrTree`) либо `composables` для того, что ставит композабл. */
  owner: string
  name: string
  kind: GrComponentTokenKind
  /** Значение, которое действует, пока токен не переопределён. */
  default: string
  description: string
}

/**
 * Производное состояние: в CSS живёт формулой `color-mix`, а `values` — тот же
 * результат, посчитанный заранее (он же уходит в `@supports not (color-mix)`).
 */
export interface GrDerivedToken {
  name: string
  section: string
  description: string
  formula: string
  /**
   * Слагаемые формулы отдельно от её текста: по ним пересчитывается фолбэк
   * `@supports not (color-mix)` для темы, которой на момент сборки пакета не
   * существовало (`extendTheme`).
   */
  base: string
  amount: number
  mixWith: string
  values: GrTokenValues
}
