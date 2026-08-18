export function splitClassTokens(value: string): string[] {
  return value.split(/\s+/).filter(Boolean)
}

/**
 * Классы набора перехода — все фазы одним списком.
 *
 * Живёт здесь, а не рядом с самим набором: safelist-гейт считает по модулю
 * целиком, и хелпер, положенный в `overlayTransition.ts`, обязал бы `GrModal`
 * объявить `scale-95`, которого модалка не рендерит.
 */
export function flattenTransitionTokens(stages: Record<string, string>): string[] {
  return Object.values(stages).flatMap(splitClassTokens)
}
