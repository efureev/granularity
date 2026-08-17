/**
 * Bullet-график Стивена Фью: величина, цель и качественные диапазоны в одну
 * строку.
 *
 * Циферблата (gauge) здесь нет и не будет: он тратит много места на мало данных
 * и плохо читается количественно — на глаз со стрелки снимают «примерно
 * посередине», а не число. Bullet решает ту же задачу полосой и сравнивается по
 * вертикали, когда таких метрик несколько.
 */

export interface BulletLayoutOptions {
  /** Измеряемая величина. `null` — величины нет; это не ноль. */
  value: number | null
  /** Целевое значение. */
  target?: number
  /** Границы качественных диапазонов. Порядок не важен — нормализуется. */
  ranges?: readonly number[]
  min?: number
  max?: number
}

export interface BulletBand {
  /**
   * Порядковый номер полосы после сортировки границ.
   *
   * По нему берётся цвет из `rangeColors`, поэтому номер обязан оставаться
   * устойчивым: границы за краем шкалы **зажимаются**, а не выбрасываются, и
   * полос всегда ровно на одну больше, чем границ.
   */
  index: number
  from: number
  to: number
}

export interface BulletModel {
  domain: [number, number]
  bands: BulletBand[]
  /** Значение, зажатое по шкале: за её краем полоса упирается в край. */
  value: number | null
  /** Настоящее значение, как его передали. */
  rawValue: number | null
  /** Значение вышло за верх шкалы — полоса получает маркер переполнения. */
  overflow: boolean
  /** Значение ниже низа шкалы. */
  underflow: boolean
  target: number | null
  /** Цель за пределами шкалы: засечку рисовать негде. */
  targetOutside: boolean
}

/** Запас над данными, когда верх шкалы не задан: полоса не должна упираться в край. */
const HEADROOM = 0.1

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function finiteOrNull(value: number | null | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

/**
 * Раскладка bullet в значениях, а не в пикселях.
 *
 * Шкала всегда начинается с `min` (по умолчанию ноль): bullet без нуля теряет
 * смысл пропорции — полоса перестаёт быть долей от цели и становится просто
 * отрезком.
 */
export function bulletLayout(options: BulletLayoutOptions): BulletModel {
  const min = finiteOrNull(options.min) ?? 0
  const rawValue = finiteOrNull(options.value)
  const target = finiteOrNull(options.target)
  const ranges = (options.ranges ?? []).filter(value => Number.isFinite(value))

  const explicitMax = finiteOrNull(options.max)
  const observed = Math.max(min, rawValue ?? min, target ?? min, ...ranges)
  const max = explicitMax ?? (observed > min ? observed + (observed - min) * HEADROOM : min + 1)

  // Вырожденная шкала дала бы деление на ноль во всех переводах в пиксели.
  const top = max > min ? max : min + 1

  const bounds = [...ranges].sort((a, b) => a - b).map(value => clamp(value, min, top))
  const edges = [min, ...bounds, top]
  const bands = edges.slice(0, -1).map((from, index) => ({ index, from, to: edges[index + 1]! }))

  return {
    domain: [min, top],
    bands,
    value: rawValue === null ? null : clamp(rawValue, min, top),
    rawValue,
    // Обрезать значение молча нельзя: полоса упирается в край, но настоящая
    // величина обязана дойти до тултипа, таблицы и объявления.
    overflow: rawValue !== null && rawValue > top,
    underflow: rawValue !== null && rawValue < min,
    target,
    targetOutside: target !== null && (target < min || target > top),
  }
}
