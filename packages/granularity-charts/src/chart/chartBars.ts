/**
 * Геометрия столбцов: раскладка серий внутри категории и путь одной полосы.
 *
 * Модуль чистый — ни Vue, ни DOM. Столбец рисуется **путём, а не `<rect rx>`**:
 * `rx` скругляет все четыре угла, и полоса, стоящая на оси, начинает выглядеть
 * оторванной от неё. Скругляется только дальний от базовой линии конец.
 */

import type { ChartOrientation } from './chartOrientation'
import { acrossBounds, alongExtent } from './chartOrientation'
import type { GrChartScale } from './chartScale'
import type { Rect } from './chartLayout'

export interface BarSlot {
  /** Смещение центра полосы от центра категории. */
  offset: number
  width: number
}

/** Куда растёт полоса от своей базовой линии — тот конец и скругляется. */
export type BarDirection = 'up' | 'down' | 'left' | 'right'

export interface BarRect {
  x: number
  y: number
  width: number
  height: number
}

export interface GroupSlotsOptions {
  /** Доля ширины слота, уходящая в зазор между сериями. */
  groupPadding?: number
}

const DEFAULT_GROUP_PADDING = 0.1

/**
 * Раскладка `count` серий внутри полосы шириной `bandwidth`.
 *
 * Одна серия занимает полосу целиком: зазор внутри группы из одного элемента
 * это просто похудевший столбец, а ширину категории уже задала шкала своим
 * `paddingInner`.
 */
export function groupSlots(
  count: number,
  bandwidth: number,
  options: GroupSlotsOptions = {},
): BarSlot[] {
  const total = Math.max(0, Math.floor(count))

  if (total === 0 || !(bandwidth > 0))
    return []

  if (total === 1)
    return [{ offset: 0, width: bandwidth }]

  const padding = Math.min(Math.max(options.groupPadding ?? DEFAULT_GROUP_PADDING, 0), 0.9)
  const slot = bandwidth / total
  const width = slot * (1 - padding)

  return Array.from({ length: total }, (_, index) => ({
    offset: -bandwidth / 2 + slot * index + slot / 2,
    width,
  }))
}

/**
 * Прямоугольник полосы между двумя координатами оси значений.
 *
 * Порядок `from`/`to` не важен: столбец вниз от нуля — такой же столбец, и
 * знать, кто из них выше, вызывающему незачем.
 *
 * `center` и `slot` живут на оси **категорий**, `from`/`to` — на оси значений;
 * ориентация решает, какая из них экранная `x`. Аргумент необязателен, поэтому
 * прежние вызовы вертикали остались как были.
 */
export function barRect(
  center: number,
  slot: BarSlot,
  from: number,
  to: number,
  orientation: ChartOrientation = 'vertical',
): BarRect {
  const near = center + slot.offset - slot.width / 2
  const start = Math.min(from, to)
  const length = Math.abs(to - from)

  return orientation === 'horizontal'
    ? { x: start, y: near, width: length, height: slot.width }
    : { x: near, y: start, width: slot.width, height: length }
}

/**
 * Куда растёт полоса от базовой линии — тот конец `barPath` и скруглит.
 *
 * Считается из экранных координат, а не из знака значения: у перевёрнутой оси
 * значений «больше» рисуется выше, и знак сам по себе ничего не сообщает.
 */
export function barToward(from: number, to: number, orientation: ChartOrientation = 'vertical'): BarDirection {
  if (orientation === 'horizontal')
    return to >= from ? 'right' : 'left'

  return to <= from ? 'up' : 'down'
}

/**
 * Ширина полосы одной категории.
 *
 * У полосной шкалы её знает сама шкала; у непрерывной ширины нет, и полоса
 * получает свою долю области с зазором — иначе на непрерывной оси столбцы
 * сомкнулись бы в сплошную заливку.
 */
export function barBandwidth(scale: GrChartScale, area: Rect, count: number, orientation: ChartOrientation = 'vertical'): number {
  if (scale.bandwidth > 0) return scale.bandwidth

  return (alongExtent(area, orientation) / Math.max(1, count)) * 0.8
}

export interface BarHitInput {
  point: { x: number, y: number }
  area: Rect
  positions: readonly number[]
  /** Шкала оси категорий. */
  scale: GrChartScale
  bandwidth: number
  orientation?: ChartOrientation
}

/**
 * Индекс категории под указателем или `-1`.
 *
 * Одно правило на обе ориентации и на все столбчатые типы: поперёк проверяются
 * границы области, вдоль — попадание в полуширину полосы. Без второй проверки
 * тултип «прилипал» бы к ближайшему столбцу через весь зазор между категориями.
 */
export function barHitIndex(input: BarHitInput): number {
  const orientation = input.orientation ?? 'vertical'
  const [low, high] = acrossBounds(input.area, orientation)
  const across = orientation === 'horizontal' ? input.point.x : input.point.y

  if (across < low || across > high) return -1
  if (input.positions.length === 0) return -1

  const along = orientation === 'horizontal' ? input.point.y : input.point.x

  let index = 0
  let best = Number.POSITIVE_INFINITY

  for (let i = 0; i < input.positions.length; i += 1) {
    const distance = Math.abs(along - input.scale.scale(input.positions[i]!))

    if (distance < best) {
      best = distance
      index = i
    }
  }

  return best <= input.bandwidth / 2 ? index : -1
}

function n(value: number): number {
  return Math.round(value * 100) / 100
}

/**
 * Путь полосы со скруглением дальнего от базовой линии конца.
 *
 * Радиус зажимается по половине поперечника и по длине: на низком столбце
 * незажатый радиус вывернул бы дугу наизнанку, а на узком — сомкнул бы её саму
 * с собой.
 *
 * Направлений четыре, потому что полоса бывает и горизонтальной: у моста
 * (`GrChartWaterfall`) при `orientation: 'horizontal'` шаги идут вправо и
 * влево, и скруглять там надо правый или левый конец. Рисовать такую полосу
 * `<rect rx>` нельзя по той же причине, что и вертикальную: `rx` скругляет все
 * четыре угла, и полоса отрывается от своей базовой линии.
 */
export function barPath(rect: BarRect, radius: number, toward: BarDirection = 'up'): string {
  const { x, y, width, height } = rect

  if (!(width > 0) || !(height > 0))
    return ''

  const vertical = toward === 'up' || toward === 'down'
  const r = Math.max(0, Math.min(radius, vertical ? width / 2 : height / 2, vertical ? height : width))

  // Команды всюду абсолютные, включая эту ветку: смесь `h`/`v` с `H`/`V` в
  // одном модуле читается хуже и разбирается тестом иначе, чем скруглённый путь.
  if (r === 0)
    return `M ${n(x)} ${n(y)} H ${n(x + width)} V ${n(y + height)} H ${n(x)} Z`

  if (toward === 'up') {
    return [
      `M ${n(x)} ${n(y + height)}`,
      `V ${n(y + r)}`,
      `A ${n(r)} ${n(r)} 0 0 1 ${n(x + r)} ${n(y)}`,
      `H ${n(x + width - r)}`,
      `A ${n(r)} ${n(r)} 0 0 1 ${n(x + width)} ${n(y + r)}`,
      `V ${n(y + height)}`,
      'Z',
    ].join(' ')
  }

  if (toward === 'down') {
    return [
      `M ${n(x)} ${n(y)}`,
      `V ${n(y + height - r)}`,
      `A ${n(r)} ${n(r)} 0 0 0 ${n(x + r)} ${n(y + height)}`,
      `H ${n(x + width - r)}`,
      `A ${n(r)} ${n(r)} 0 0 0 ${n(x + width)} ${n(y + height - r)}`,
      `V ${n(y)}`,
      'Z',
    ].join(' ')
  }

  if (toward === 'right') {
    return [
      `M ${n(x)} ${n(y)}`,
      `H ${n(x + width - r)}`,
      `A ${n(r)} ${n(r)} 0 0 1 ${n(x + width)} ${n(y + r)}`,
      `V ${n(y + height - r)}`,
      `A ${n(r)} ${n(r)} 0 0 1 ${n(x + width - r)} ${n(y + height)}`,
      `H ${n(x)}`,
      'Z',
    ].join(' ')
  }

  return [
    `M ${n(x + width)} ${n(y)}`,
    `H ${n(x + r)}`,
    `A ${n(r)} ${n(r)} 0 0 0 ${n(x)} ${n(y + r)}`,
    `V ${n(y + height - r)}`,
    `A ${n(r)} ${n(r)} 0 0 0 ${n(x + r)} ${n(y + height)}`,
    `H ${n(x + width)}`,
    'Z',
  ].join(' ')
}
