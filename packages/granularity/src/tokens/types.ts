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
 * Производное состояние: в CSS живёт формулой `color-mix`, а `values` — тот же
 * результат, посчитанный заранее (он же уходит в `@supports not (color-mix)`).
 */
export interface GrDerivedToken {
  name: string
  section: string
  description: string
  formula: string
  values: GrTokenValues
}
