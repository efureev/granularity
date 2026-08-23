/**
 * Арифметика времени плеера.
 *
 * Отдельным модулем, потому что ошибается она незаметно: подпись «1:5» вместо
 * «1:05», перемотка на секунду мимо конца, полоса буфера длиннее самого ролика.
 * Проверить это рендером нельзя — в тестовом окружении видео не воспроизводится.
 */

/**
 * Время в подписи: `0:07`, `4:20`, `1:02:03`.
 *
 * Часы появляются только когда они есть: `0:00:07` у ролика на семь секунд
 * читается как ошибка. Минуты и секунды всегда двузначные после первой группы —
 * иначе `1:5` выглядит как «час пять».
 */
export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0)
    return '0:00'

  const total = Math.floor(seconds)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const rest = total % 60
  const pad = (value: number) => String(value).padStart(2, '0')

  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(rest)}`
    : `${minutes}:${pad(rest)}`
}

/** Позиция в пределах ролика: перемотка стрелками легко выходит за края. */
export function clampTime(value: number, duration: number): number {
  if (!Number.isFinite(duration) || duration <= 0)
    return 0

  return Math.min(duration, Math.max(0, value))
}

/** Доля просмотренного, 0–100. */
export function progressPercent(current: number, duration: number): number {
  if (!Number.isFinite(duration) || duration <= 0)
    return 0

  return clampTime(current, duration) / duration * 100
}

/**
 * Докуда загружено, 0–100.
 *
 * Берётся диапазон, **накрывающий текущую позицию**, а не последний: браузер
 * держит их несколько, и после перемотки назад последний диапазон относится к
 * другому куску ролика — полоса буфера прыгала бы вперёд на пустом месте.
 */
export function bufferedPercent(
  buffered: { length: number, start: (index: number) => number, end: (index: number) => number } | null,
  current: number,
  duration: number,
): number {
  if (!buffered || !Number.isFinite(duration) || duration <= 0)
    return 0

  for (let index = 0; index < buffered.length; index += 1) {
    if (buffered.start(index) <= current && current <= buffered.end(index))
      return Math.min(100, buffered.end(index) / duration * 100)
  }

  return 0
}
