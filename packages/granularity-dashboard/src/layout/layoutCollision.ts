/**
 * Пересечения и компактизация.
 *
 * Четыре режима компактизации — это два прохода укладки в разных сочетаниях;
 * общий скелет обоих живёт в `pack`. Все они проходят через один и тот же
 * `resolveCollisions`; отличается только финальный проход.
 */
import type {
  GrDashboardCompaction,
  GrDashboardItemLayout,
  GrDashboardLayout,
} from './layoutModel'
import { sortLayout } from './layoutModel'
import { layoutsEqual } from './layoutSerialize'

export function collides(a: GrDashboardItemLayout, b: GrDashboardItemLayout): boolean {
  if (a.id === b.id) return false

  return a.x < b.x + b.w
    && a.x + a.w > b.x
    && a.y < b.y + b.h
    && a.y + a.h > b.y
}

export function firstCollision(
  layout: GrDashboardLayout,
  item: GrDashboardItemLayout,
): GrDashboardItemLayout | undefined {
  return layout.find(other => collides(other, item))
}

export function collisionsWith(
  layout: GrDashboardLayout,
  item: GrDashboardItemLayout,
): GrDashboardLayout {
  return layout.filter(other => collides(other, item))
}

/** Порядок укладки по горизонтали: слева направо, сверху вниз. Зеркало `sortLayout`. */
function byColumn(layout: GrDashboardLayout): GrDashboardLayout {
  return [...layout].sort((a, b) => a.x - b.x || a.y - b.y || a.id.localeCompare(b.id))
}

function coordOf(item: GrDashboardItemLayout, axis: PackAxis): number {
  return axis === 'y' ? item.y : item.x
}

function withCoord(item: GrDashboardItemLayout, axis: PackAxis, value: number): GrDashboardItemLayout {
  return axis === 'y' ? { ...item, y: value } : { ...item, x: value }
}

type PackAxis = 'x' | 'y'

interface PackOptions {
  axis: PackAxis
  /**
   * Уйти вперёд по оси из-под пересечения.
   *
   * По `y` это всегда возможно — строк бесконечно много. По `x` невозможно:
   * `x + w <= cols` ставит стену, и виджеты, чья суммарная ширина в полосе строк
   * больше числа колонок, развести по горизонтали нельзя в принципе.
   */
  settle: boolean
  /** Подтянуться назад по оси, пока не упрётся в соседа или в край. */
  float: boolean
}

/**
 * Один проход укладки по одной оси.
 *
 * Статика укладывается первой: иначе подвижный виджет занял бы её место, а
 * подвинуть её потом нечем — по определению.
 */
function pack(layout: GrDashboardLayout, options: PackOptions): GrDashboardLayout {
  const { axis, settle, float } = options
  const sorted = axis === 'y' ? sortLayout(layout) : byColumn(layout)
  const placed: GrDashboardLayout = []

  for (const item of [...sorted.filter(i => i.static), ...sorted.filter(i => !i.static)]) {
    if (item.static) {
      placed.push(item)
      continue
    }

    const origin = coordOf(item, axis)
    let value = origin

    if (settle) while (firstCollision(placed, withCoord(item, axis, value))) value += 1
    if (float) while (value > 0 && !firstCollision(placed, withCoord(item, axis, value - 1))) value -= 1

    placed.push(value === origin ? item : withCoord(item, axis, value))
  }

  return sortLayout(placed)
}

/**
 * Поднимает виджеты вверх, пока они не упрутся в соседа или в край.
 *
 * Тотальна: вход с пересечениями сначала разводится вниз, поэтому
 * `compact(compact(l))` совпадает с `compact(l)` на любых данных.
 */
function compactVertical(layout: GrDashboardLayout): GrDashboardLayout {
  return pack(layout, { axis: 'y', settle: true, float: true })
}

/**
 * Разводит пересечения вниз, никого не поднимая.
 *
 * На корректной раскладке тождественна — отсюда контракт горизонтального
 * режима: строки он не меняет. Проход не декоративный: `deriveLayout`
 * пересечения не разводит сам и полагается на компактизацию, а развести их
 * вправо нельзя (см. `PackOptions.settle`).
 */
function settleDown(layout: GrDashboardLayout): GrDashboardLayout {
  return pack(layout, { axis: 'y', settle: true, float: false })
}

/** Придвигает виджеты к левому краю. Уменьшает только `x`, поэтому `x + w <= cols` цел. */
function slideLeft(layout: GrDashboardLayout): GrDashboardLayout {
  return pack(layout, { axis: 'x', settle: false, float: true })
}

/**
 * Уплотняет по обеим осям до неподвижной точки.
 *
 * Одного прохода «вверх, потом влево» мало: уехавший влево виджет освобождает
 * место над соседом, и следующий проход поднял бы его — то есть
 * `compact(compact(l))` разошлось бы с `compact(l)`.
 *
 * Итерация конечна. После первого прохода пересечений нет; дальше `slideLeft`
 * уменьшает только `x`, а `compactVertical` на бесколлизионном входе — только
 * `y` (первый цикл не срабатывает: всплывший сосед не может наехать на того,
 * кто идёт следом). Значит потенциал `Σ(x + y)` — целый, неотрицательный и
 * строго убывающий на каждой изменившей раскладку итерации. Он же и есть
 * верхняя граница числа итераций, то есть значение `guard`.
 */
function compactBoth(layout: GrDashboardLayout): GrDashboardLayout {
  let current = compactVertical(layout)
  let guard = current.reduce((sum, item) => sum + item.x + item.y, 0)

  while (guard > 0) {
    const next = compactVertical(slideLeft(current))
    if (layoutsEqual(next, current)) return next

    current = next
    guard -= 1
  }

  return current
}

export function compact(layout: GrDashboardLayout, mode: GrDashboardCompaction): GrDashboardLayout {
  switch (mode) {
    case 'vertical': return compactVertical(layout)
    case 'horizontal': return slideLeft(settleDown(layout))
    case 'both': return compactBoth(layout)
    // `default` рядом с `'none'` намеренно: режим приходит и из нетипизированного
    // JS, где значение может оказаться любым.
    case 'none':
    default: return sortLayout(layout)
  }
}

export interface ResolveCollisionsOptions {
  /** Столкновение отменяет перемещение целиком, а не толкает соседей. */
  preventCollision?: boolean
}

/**
 * Разводит пересечения после того, как виджет `movedId` встал на новое место.
 *
 * Толкает столкнувшихся **вниз**, в любом режиме компактизации: строк
 * бесконечно много, а вправо мешает `x + w <= cols` — толчок туда разрешим не
 * всегда. Толчок распространяется по цепочке, поэтому обход — очередью, а не
 * рекурсией.
 *
 * `null` означает «так положить нельзя»: перемещение упёрлось в статику или
 * запрещено `preventCollision`. Вернуть вместо этого вход нельзя — в нём
 * виджет уже стоит на новом месте, и вызывающий принял бы отказ за успех.
 */
export function resolveCollisions(
  layout: GrDashboardLayout,
  movedId: string,
  options: ResolveCollisionsOptions = {},
): GrDashboardLayout | null {
  const items = layout.map(item => ({ ...item }))
  const moved = items.find(item => item.id === movedId)
  if (!moved) return sortLayout(items)

  const blocked = collisionsWith(items, moved)
  if (blocked.length === 0) return sortLayout(items)
  if (options.preventCollision || blocked.some(item => item.static)) return null

  const statics = items.filter(item => item.static)

  // Цепочка толчков конечна: `y` каждого сдвинутого строго растёт. Счётчик
  // страхует от данных, в которых цепочка замкнулась сама на себя.
  const queue: GrDashboardItemLayout[] = [moved]
  let guard = items.length * items.length + items.length

  while (queue.length > 0 && guard > 0) {
    guard -= 1
    const current = queue.shift()
    if (!current) break

    for (const other of items) {
      if (other.static || !collides(other, current)) continue

      other.y = current.y + current.h

      // Толчок, упёршийся в статику, отменяет всё перемещение: положить виджет
      // поверх неподвижного — это молча испорченная раскладка.
      if (firstCollision(statics, other)) return null

      queue.push(other)
    }
  }

  return sortLayout(items)
}
