/**
 * Классы-метки: собственного CSS не дают и не должны. Это точки зацепа для
 * вариантов — `peer-checked:`, `group-hover/segmented-item:`, — и в safelist им
 * не место: запись, для которой у движка нет правила, диагностика справедливо
 * зовёт мёртвой (`safelist-dead`), и находка эта была бы вечной.
 *
 * Из разметки они, разумеется, не убираются: там они и работают.
 */
const MARKER_CLASSES = /^(?:peer|group)(?:\/[\w-]+)?$/

export function splitClassTokens(value: string): string[] {
  return value.split(/\s+/).filter(token => token.length > 0 && !MARKER_CLASSES.test(token))
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
