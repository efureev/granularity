/**
 * Единый перечень дизайн-тонов для всех компонентов библиотеки.
 *
 * Источник истины: список объявлен как `as const`-кортеж, из которого
 * автоматически выводится тип `GrTone`. Это позволяет использовать
 * `GR_TONES` в рантайме (валидация, итерация, safelist) и `GrTone`
 * в типах одновременно, без расхождений.
 */
export const GR_TONES = [
  'primary',
  'neutral',
  'success',
  'warning',
  'danger',
  'info',
  'slate',
  'azure',
] as const

export type GrTone = typeof GR_TONES[number]
