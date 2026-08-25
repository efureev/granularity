/** С какой стороны у скроллера осталось невидимое содержимое. */
export type GrScrollOverflow = 'none' | 'start' | 'end' | 'both'

/**
 * Состояние переполнения скроллера — по трём числам, без DOM.
 *
 * Отдельным модулем, потому что в jsdom раскладки нет: `scrollWidth` и
 * `clientWidth` там нули, и через смонтированный компонент ни одна ветка не
 * проверяется. Здесь она проверяется вся.
 *
 * `scrollStart` — расстояние от начала ряда, а не `scrollLeft`. Это не
 * педантизм: в RTL современные браузеры отсчитывают `scrollLeft` от правого
 * края и уводят его в минус, поэтому физическое «слева» и логическое «в начале»
 * там не совпадают. Модуль знает только про начало и конец, а какой это край
 * экрана — дело CSS.
 *
 * Запас в пиксель — как в {@link titleWhenTruncated}: браузеры округляют
 * размеры вверх, и у ряда, влезающего целиком, разница бывает единичной.
 * Без запаса затухание висело бы на ровном месте.
 */
export function resolveScrollOverflow(
  scrollStart: number,
  scrollSize: number,
  clientSize: number,
): GrScrollOverflow {
  const hidden = scrollSize - clientSize

  if (hidden <= 1)
    return 'none'

  const start = Math.abs(scrollStart)
  const atStart = start <= 1
  const atEnd = hidden - start <= 1

  if (atStart && atEnd)
    return 'none'

  if (atStart)
    return 'end'

  if (atEnd)
    return 'start'

  return 'both'
}
