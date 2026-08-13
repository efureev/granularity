/**
 * Геометрия столбцов: раскладка серий внутри категории и путь одной полосы.
 *
 * Модуль чистый — ни Vue, ни DOM. Столбец рисуется **путём, а не `<rect rx>`**:
 * `rx` скругляет все четыре угла, и полоса, стоящая на оси, начинает выглядеть
 * оторванной от неё. Скругляется только дальний от базовой линии конец.
 */

export interface BarSlot {
  /** Смещение центра полосы от центра категории. */
  offset: number
  width: number
}

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
 * Прямоугольник полосы между двумя координатами по вертикали.
 *
 * Порядок `from`/`to` не важен: столбец вниз от нуля — такой же столбец, и
 * знать, кто из них выше, вызывающему незачем.
 */
export function barRect(center: number, slot: BarSlot, from: number, to: number): BarRect {
  return {
    x: center + slot.offset - slot.width / 2,
    y: Math.min(from, to),
    width: slot.width,
    height: Math.abs(to - from),
  }
}

function n(value: number): number {
  return Math.round(value * 100) / 100
}

/**
 * Путь полосы со скруглением дальнего от базовой линии конца.
 *
 * Радиус зажимается по половине ширины и по высоте: на низком столбце
 * незажатый радиус вывернул бы дугу наизнанку, а на узком — сомкнул бы её саму
 * с собой.
 */
export function barPath(rect: BarRect, radius: number, up = true): string {
  const { x, y, width, height } = rect

  if (!(width > 0) || !(height > 0))
    return ''

  const r = Math.max(0, Math.min(radius, width / 2, height))

  // Команды всюду абсолютные, включая эту ветку: смесь `h`/`v` с `H`/`V` в
  // одном модуле читается хуже и разбирается тестом иначе, чем скруглённый путь.
  if (r === 0)
    return `M ${n(x)} ${n(y)} H ${n(x + width)} V ${n(y + height)} H ${n(x)} Z`

  if (up) {
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
