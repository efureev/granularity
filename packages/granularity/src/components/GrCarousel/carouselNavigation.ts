/** Сколько пикселей должен пройти указатель, чтобы это считалось листанием. */
export const SWIPE_THRESHOLD_PX = 60

/**
 * Во сколько раз горизонталь обязана превысить вертикаль. Ниже этого жест
 * считается вертикальной прокруткой страницы и ленту не двигает: палец редко
 * идёт строго по оси, и без фильтра карусель перехватывала бы скролл.
 */
export const SWIPE_AXIS_RATIO = 1.5

/**
 * Доля ширины вьюпорта, начиная с которой жест засчитывается. Работает вместе
 * с {@link SWIPE_THRESHOLD_PX} по максимуму: 60px на герое шириной 1200px —
 * это нервно, а на узкой карточке доля выродилась бы в пару пикселей.
 */
export const SWIPE_THRESHOLD_RATIO = 0.15

/** Во сколько раз вязче идёт лента, когда листать в эту сторону уже некуда. */
export const SWIPE_RESISTANCE = 4

/**
 * Логическое направление жеста: `1` — вперёд, `-1` — назад, `0` — не свайп.
 *
 * `dx` физический, в пикселях экрана; разворот под RTL — забота вызывающего,
 * модуль про направление письма не знает. Палец, ушедший влево, листает вперёд:
 * содержимое едет за пальцем, как в нативной прокрутке.
 *
 * Отдельным модулем, потому что в jsdom раскладки нет и через смонтированный
 * компонент ни одна ветка не проверяется — тот же довод, что у
 * {@link resolveScrollOverflow}.
 */
export function resolveSwipeDirection(
  dx: number,
  dy: number,
  threshold: number = SWIPE_THRESHOLD_PX,
): -1 | 0 | 1 {
  if (Math.abs(dx) < threshold)
    return 0

  if (Math.abs(dx) < Math.abs(dy) * SWIPE_AXIS_RATIO)
    return 0

  return dx < 0 ? 1 : -1
}

/**
 * Порог жеста для ленты шириной `width`. При нулевой ширине — а в jsdom она
 * всегда нулевая — вырождается в пиксельный минимум, и жест остаётся
 * проверяемым.
 */
export function swipeThresholdFor(width: number): number {
  return Math.max(SWIPE_THRESHOLD_PX, width * SWIPE_THRESHOLD_RATIO)
}

/** Смещение ленты за пальцем: за краем — вязкое, иначе один в один. */
export function resistOffset(delta: number, atEdge: boolean): number {
  return atEdge ? delta / SWIPE_RESISTANCE : delta
}

/**
 * Индекс, зажатый в границы ленты. Пустая лента даёт `0`: слайда с таким
 * номером нет, но отрицательный индекс уехал бы в CSS-переменную трека.
 */
export function clampIndex(index: number, count: number): number {
  if (count <= 0)
    return 0

  if (!Number.isFinite(index))
    return 0

  return Math.min(Math.max(Math.trunc(index), 0), count - 1)
}

/**
 * Шаг по ленте. Без `loop` на краю возвращает тот же индекс — вызывающий по
 * этому признаку и гасит стрелку, отдельного предиката не нужно.
 */
export function stepIndex(index: number, delta: number, count: number, loop: boolean): number {
  if (count <= 0)
    return 0

  const current = clampIndex(index, count)
  const next = current + delta

  if (loop)
    return ((next % count) + count) % count

  return clampIndex(next, count)
}
