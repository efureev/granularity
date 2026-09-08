/**
 * Арифметика двумерной области насыщенность × светлота.
 *
 * Модуль чистый: ни DOM, ни Vue. Всё, что здесь считается, проверяется без
 * монтирования — а в jsdom у области нет ни размеров, ни попадания указателя.
 *
 * Оси выбраны под модель компонента (HSL), а не под привычный HSV-квадрат.
 * Перевод в HSV дал бы более нарядную заливку, но принёс бы вторую проекцию с
 * потерями: при `v = 0` насыщенность HSV не определена, и чёрный терял бы её
 * ровно так же, как серый теряет оттенок. Компонент уже держит своё состояние
 * именно чтобы такого не было.
 */

export type GrColorAreaAxis = 'saturation' | 'lightness'

/** Точка области в процентах: обе координаты — значения каналов, а не пиксели. */
export interface GrColorAreaPoint {
  s: number
  l: number
}

/** Шаг стрелки и крупный шаг `PageUp`/`PageDown` — те же, что у `GrSlider`. */
const STEP = 1
const PAGE_STEP = 10

function clamp(value: number): number {
  return Math.min(100, Math.max(0, value))
}

/**
 * Положение ручки в процентах от левого верхнего угла.
 *
 * Светлота инвертирована: вверху области белое, внизу чёрное — так стоит
 * вертикальная шкала во всех привычных пикерах, и переворачивать её значило бы
 * ломать ожидание ради буквальности.
 */
export function colorAreaThumbPosition(point: GrColorAreaPoint): { x: number, y: number } {
  return { x: clamp(point.s), y: 100 - clamp(point.l) }
}

/**
 * Значение под указателем.
 *
 * Прямоугольник приходит снаружи: измерять его умеет только вызывающий, а
 * промах мимо области — норма, указатель уходит за её границы при каждом
 * протягивании.
 */
export function colorAreaPointAt(
  pointer: { clientX: number, clientY: number },
  rect: { left: number, top: number, width: number, height: number },
): GrColorAreaPoint {
  const s = rect.width > 0 ? ((pointer.clientX - rect.left) / rect.width) * 100 : 0
  const y = rect.height > 0 ? ((pointer.clientY - rect.top) / rect.height) * 100 : 0

  return { s: clamp(s), l: clamp(100 - y) }
}

/**
 * Клавиша → новое значение и ось, которая изменилась.
 *
 * Ось возвращается не для отчёта: у области два настоящих `input[type=range]`,
 * по одному на канал, и стрелка поперёк оси сфокусированного поля обязана
 * увести фокус на соседнее — иначе диктор промолчит о том, что изменилось.
 *
 * `Home`/`End` и крупный шаг работают по оси **сфокусированного** поля: они
 * относятся к диапазону, а диапазонов здесь два.
 */
export function colorAreaKeyStep(
  key: string,
  point: GrColorAreaPoint,
  focused: GrColorAreaAxis,
): { point: GrColorAreaPoint, axis: GrColorAreaAxis } | null {
  const move = (axis: GrColorAreaAxis, next: number) => ({
    point: axis === 'saturation'
      ? { s: clamp(next), l: point.l }
      : { s: point.s, l: clamp(next) },
    axis,
  })

  const current = focused === 'saturation' ? point.s : point.l

  switch (key) {
    case 'ArrowLeft':
      return move('saturation', point.s - STEP)
    case 'ArrowRight':
      return move('saturation', point.s + STEP)
    case 'ArrowDown':
      return move('lightness', point.l - STEP)
    case 'ArrowUp':
      return move('lightness', point.l + STEP)
    case 'PageDown':
      return move(focused, current - PAGE_STEP)
    case 'PageUp':
      return move(focused, current + PAGE_STEP)
    case 'Home':
      return move(focused, 0)
    case 'End':
      return move(focused, 100)
    default:
      return null
  }
}
