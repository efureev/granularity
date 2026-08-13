/**
 * Пересечения и компактизация.
 *
 * Обе ветки компактизации (`vertical` и `none`) проходят через один и тот же
 * `resolveCollisions`; отличается только финальный проход.
 */
import type {
  GrDashboardCompaction,
  GrDashboardItemLayout,
  GrDashboardLayout,
} from './layoutModel'
import { sortLayout } from './layoutModel'

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

/**
 * Поднимает виджеты вверх, пока они не упрутся в соседа или в край.
 *
 * Статика укладывается первой: иначе подвижный виджет занял бы её место, а
 * подвинуть её потом нечем — по определению.
 *
 * Функция тотальна: вход с пересечениями сначала разводится вниз, поэтому
 * `compact(compact(l))` совпадает с `compact(l)` на любых данных.
 */
function compactVertical(layout: GrDashboardLayout): GrDashboardLayout {
  const sorted = sortLayout(layout)
  const placed: GrDashboardLayout = []

  for (const item of [...sorted.filter(i => i.static), ...sorted.filter(i => !i.static)]) {
    if (item.static) {
      placed.push(item)
      continue
    }

    let y = item.y
    while (firstCollision(placed, { ...item, y })) y += 1
    while (y > 0 && !firstCollision(placed, { ...item, y: y - 1 })) y -= 1

    placed.push(y === item.y ? item : { ...item, y })
  }

  return sortLayout(placed)
}

export function compact(layout: GrDashboardLayout, mode: GrDashboardCompaction): GrDashboardLayout {
  return mode === 'vertical' ? compactVertical(layout) : sortLayout(layout)
}

export interface ResolveCollisionsOptions {
  /** Столкновение отменяет перемещение целиком, а не толкает соседей. */
  preventCollision?: boolean
}

/**
 * Разводит пересечения после того, как виджет `movedId` встал на новое место.
 *
 * Толкает столкнувшихся **вниз**: только это направление не спорит с
 * компактизацией, которая тянет всех вверх. Толчок распространяется по цепочке,
 * поэтому обход — очередью, а не рекурсией.
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
