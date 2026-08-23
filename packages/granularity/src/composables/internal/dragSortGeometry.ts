/**
 * Геометрия перестановки: чистая арифметика без DOM и без реактивности.
 *
 * Вынесена отдельно, потому что ошибка здесь проявляется не исключением, а
 * «элемент встал не туда» — поймать это можно только тестом на числах.
 * Композабл `useDragSort` сводит `DOMRect` к отрезкам вдоль оси и зовёт эти
 * функции; какой смысл у попадания, решает уже компонент.
 */

/** Отрезок, занимаемый элементом вдоль оси переноса. */
export interface DragSortSpan {
  start: number
  end: number
}

export interface DragSortHitResult {
  /** Индекс элемента в переданном наборе. */
  index: number
  /** Доля вдоль элемента: 0 — его начало, 1 — конец. */
  fraction: number
}

/**
 * Какой элемент под указателем и в каком месте его.
 *
 * Промах не отбрасывается: между строками есть зазоры, а курсор уезжает за
 * край списка — и в обоих случаях перенос обязан продолжать показывать
 * ближайшую цель, иначе индикатор мигает на каждом пикселе между строками.
 *
 * Вырожденный отрезок (нулевая высота строки) даёт `fraction: 0` — цель
 * остаётся детерминированной, а не зависящей от направления подхода.
 */
export function hitTest(spans: readonly DragSortSpan[], position: number): DragSortHitResult | null {
  if (spans.length === 0)
    return null

  let nearestIndex = 0
  let nearestDistance = Number.POSITIVE_INFINITY

  for (let index = 0; index < spans.length; index += 1) {
    const span = spans[index]

    if (position >= span.start && position <= span.end)
      return { index, fraction: fractionIn(span, position) }

    const distance = position < span.start ? span.start - position : position - span.end
    if (distance < nearestDistance) {
      nearestDistance = distance
      nearestIndex = index
    }
  }

  const nearest = spans[nearestIndex]

  return { index: nearestIndex, fraction: fractionIn(nearest, position) }
}

function fractionIn(span: DragSortSpan, position: number): number {
  const size = span.end - span.start
  if (size <= 0)
    return 0

  return clamp((position - span.start) / size, 0, 1)
}

/**
 * Куда встанет элемент, если отпустить сейчас.
 *
 * Верхняя половина строки — «до неё», нижняя — «после». Индекс возвращается
 * **в терминах итогового массива**, то есть уже с поправкой на то, что
 * перетаскиваемый элемент из него временно вынут: без поправки перенос вниз
 * на одну позицию не двигал бы ничего.
 */
export function insertionIndex(hit: DragSortHitResult, from: number, count: number): number {
  if (count <= 0)
    return 0

  const base = hit.fraction < 0.5 ? hit.index : hit.index + 1
  const adjusted = from < base ? base - 1 : base

  return clamp(adjusted, 0, count - 1)
}

export interface AutoScrollOptions {
  /** Ширина чувствительной полосы у каждого края, px. По умолчанию 32. */
  zone?: number
  /** Скорость на самом краю, px за кадр. По умолчанию 12. */
  speed?: number
}

/**
 * На сколько прокрутить контейнер за кадр: отрицательное — к началу.
 *
 * Скорость растёт линейно по мере приближения к краю, а не включается
 * ступенькой: ступенька на длинном списке ощущается как рывок и промахивается
 * мимо цели.
 */
export function autoScrollDelta(viewport: DragSortSpan, position: number, options: AutoScrollOptions = {}): number {
  const zone = options.zone ?? 32
  const speed = options.speed ?? 12

  if (zone <= 0 || speed <= 0)
    return 0
  // Вьюпорт короче двух зон: полосы наложились бы и тянули список в обе стороны.
  if (viewport.end - viewport.start <= zone * 2)
    return 0

  if (position < viewport.start || position > viewport.end)
    return 0

  const fromStart = position - viewport.start
  if (fromStart < zone)
    return -Math.ceil(((zone - fromStart) / zone) * speed)

  const fromEnd = viewport.end - position
  if (fromEnd < zone)
    return Math.ceil(((zone - fromEnd) / zone) * speed)

  return 0
}

/**
 * Перестановка без мутации входа: массив потребителя остаётся нетронутым,
 * наружу уходит новый. `v-model` с мутацией исходного набора ломает и
 * сравнение «было — стало», и историю в сторе потребителя.
 */
export function moveItem<T>(items: readonly T[], from: number, to: number): T[] {
  const next = items.slice()
  if (from === to || from < 0 || from >= items.length)
    return next

  const [moved] = next.splice(from, 1)
  next.splice(clamp(to, 0, next.length), 0, moved)

  return next
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
