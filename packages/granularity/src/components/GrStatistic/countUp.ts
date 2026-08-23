/**
 * Перебор чисел для `GrStatistic`: чистая арифметика кадра без Vue и таймеров.
 *
 * Вынесено отдельным модулем по той же причине, что и `formatStatisticValue`:
 * кривая и округление проверяются напрямую, без монтирования и подмены `rAF`.
 */

/** Быстрый старт, мягкая остановка — та же форма, что у `--gr-ease-out`. */
export function easeOutCubic(t: number): number {
  const clamped = Math.min(Math.max(t, 0), 1)
  return 1 - (1 - clamped) ** 3
}

/**
 * Значение кадра на `elapsed` миллисекунде перехода `from → to`.
 *
 * Округление до `precision` обязательно: без него кадры показывали бы
 * `1283.6666666666667` там, где показатель целый, и ширина строки прыгала бы
 * даже при `tabular-nums`. Последний кадр возвращает ровно `to` — приближение
 * не должно оставлять показатель в 1283.9999.
 */
export function countUpFrame(
  from: number,
  to: number,
  elapsed: number,
  duration: number,
  precision?: number,
): number {
  if (!(duration > 0) || elapsed >= duration)
    return to

  const digits = Math.min(Math.max(precision ?? 0, 0), 20)
  const value = from + (to - from) * easeOutCubic(elapsed / duration)

  return Number(value.toFixed(digits))
}
