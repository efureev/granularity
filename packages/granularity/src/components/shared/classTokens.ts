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
