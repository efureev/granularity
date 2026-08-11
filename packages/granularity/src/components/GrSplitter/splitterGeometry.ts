/**
 * Арифметика раздвижных панелей. Без Vue — проверяется без монтирования.
 *
 * Всё считается в процентах ширины (или высоты) контейнера: клавиатура,
 * границы и сворачивание работают без единого замера DOM, а серверный рендер
 * совпадает с клиентским. Замер нужен ровно в одном месте — перевод координаты
 * указателя в проценты.
 */

export const GR_SPLITTER_ORIENTATIONS = ['horizontal', 'vertical'] as const

export type GrSplitterOrientation = typeof GR_SPLITTER_ORIENTATIONS[number]

export interface GrSplitterBounds {
  /** Минимум первой панели. */
  min: number
  /** Максимум первой панели. */
  max: number
  /** Минимум второй панели: без него её можно задавить в ноль. */
  minEnd: number
}

function toFinite(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback
}

/**
 * Приводит долю первой панели к допустимой.
 *
 * При конфликте `min` и `minEnd` побеждает `min`: первая панель не должна
 * уезжать под свой минимум, даже если вторая при этом окажется уже своего.
 * Обратный порядок дал бы панель, которую пользователь не может вернуть.
 */
export function clampSize(value: number, bounds: GrSplitterBounds): number {
  const min = Math.min(100, Math.max(0, toFinite(bounds.min, 0)))
  const max = Math.min(100, Math.max(min, toFinite(bounds.max, 100)))
  const minEnd = Math.min(100, Math.max(0, toFinite(bounds.minEnd, 0)))

  const upper = Math.max(min, Math.min(max, 100 - minEnd))

  return Math.min(upper, Math.max(min, toFinite(value, min)))
}

/** Доля, соответствующая позиции указателя. Вне контейнера — его края. */
export function sizeFromPointer(
  rect: { left: number, top: number, width: number, height: number },
  clientX: number,
  clientY: number,
  orientation: GrSplitterOrientation,
): number {
  const total = orientation === 'horizontal' ? rect.width : rect.height
  // Схлопнутый контейнер (ещё не в раскладке, `display: none`) — делить не на что.
  if (!(total > 0)) return 0

  const offset = orientation === 'horizontal' ? clientX - rect.left : clientY - rect.top

  return Math.min(100, Math.max(0, (offset / total) * 100))
}

/**
 * Тянуть панель ниже половины её минимума пользователь может только с одним
 * намерением — убрать её совсем. Это единственный способ свернуть панель
 * мышью: двойной клик занят сбросом к дефолту, `Enter` — клавиатурой.
 */
export function shouldCollapse(value: number, bounds: GrSplitterBounds): boolean {
  const min = Math.min(100, Math.max(0, toFinite(bounds.min, 0)))
  if (min <= 0) return false

  return toFinite(value, min) < min / 2
}
