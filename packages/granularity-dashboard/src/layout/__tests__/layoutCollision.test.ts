import { describe, expect, it } from 'vitest'

import type { GrDashboardCompaction, GrDashboardLayout } from '../layoutModel'
import { sortLayout } from '../layoutModel'
import { collides, compact, resolveCollisions } from '../layoutCollision'

/** Пересечений нет ни у одной пары — инвариант, ради которого всё это и есть. */
function hasOverlap(layout: GrDashboardLayout): boolean {
  return layout.some((item, index) => layout.slice(index + 1).some(other => collides(item, other)))
}

/** Есть ли виджет, который может сдвинуться на ячейку к началу оси. */
function canFloat(layout: GrDashboardLayout, axis: 'x' | 'y'): boolean {
  return layout.some((item) => {
    if (item.static || item[axis] === 0) return false

    const moved = axis === 'x' ? { ...item, x: item.x - 1 } : { ...item, y: item.y - 1 }

    return !layout.some(other => collides(other, moved))
  })
}

/**
 * Раскладка из детерминированного генератора: тот же сид — та же раскладка,
 * поэтому упавший property-тест воспроизводится, а не «иногда краснеет».
 */
function randomLayout(count: number, seed: number): GrDashboardLayout {
  let state = seed * 2654435761 % 2147483647
  const next = (bound: number): number => {
    state = state * 48271 % 2147483647

    return state % bound
  }

  // Статика ровно одна: две пересекающиеся развести нечем ни в одном режиме —
  // это известное и намеренное поведение, а не то, что должен ловить генератор.
  const staticIndex = next(count)

  return Array.from({ length: count }, (_, index) => {
    const w = 1 + next(4)

    return {
      id: `w${index}`,
      x: next(Math.max(1, 12 - w + 1)),
      y: next(6),
      w,
      h: 1 + next(3),
      ...(index === staticIndex ? { static: true } : {}),
    }
  })
}

describe('collides', () => {
  it('соприкосновение краями пересечением не считает', () => {
    expect(collides(
      { id: 'a', x: 0, y: 0, w: 2, h: 2 },
      { id: 'b', x: 2, y: 0, w: 2, h: 2 },
    )).toBe(false)

    expect(collides(
      { id: 'a', x: 0, y: 0, w: 2, h: 2 },
      { id: 'b', x: 0, y: 2, w: 2, h: 2 },
    )).toBe(false)
  })

  it('сам с собой не пересекается', () => {
    const item = { id: 'a', x: 0, y: 0, w: 2, h: 2 }

    expect(collides(item, { ...item })).toBe(false)
  })

  it('находит частичное наложение', () => {
    expect(collides(
      { id: 'a', x: 0, y: 0, w: 2, h: 2 },
      { id: 'b', x: 1, y: 1, w: 2, h: 2 },
    )).toBe(true)
  })
})

describe('compact', () => {
  it('подтягивает виджеты вверх, не оставляя дыр', () => {
    const result = compact([
      { id: 'a', x: 0, y: 0, w: 2, h: 2 },
      { id: 'b', x: 0, y: 5, w: 2, h: 1 },
      { id: 'c', x: 2, y: 9, w: 2, h: 1 },
    ], 'vertical')

    expect(result).toEqual([
      { id: 'a', x: 0, y: 0, w: 2, h: 2 },
      { id: 'c', x: 2, y: 0, w: 2, h: 1 },
      { id: 'b', x: 0, y: 2, w: 2, h: 1 },
    ])
  })

  it('идемпотентна', () => {
    const layout: GrDashboardLayout = [
      { id: 'a', x: 0, y: 4, w: 2, h: 2 },
      { id: 'b', x: 1, y: 5, w: 2, h: 1 },
      { id: 'c', x: 0, y: 0, w: 4, h: 1 },
    ]
    const once = compact(layout, 'vertical')

    expect(compact(once, 'vertical')).toEqual(once)
  })

  it('разводит пересечения на любом входе', () => {
    const result = compact([
      { id: 'a', x: 0, y: 0, w: 3, h: 2 },
      { id: 'b', x: 1, y: 1, w: 3, h: 2 },
      { id: 'c', x: 2, y: 0, w: 3, h: 2 },
    ], 'vertical')

    expect(hasOverlap(result)).toBe(false)
  })

  it('не двигает статику: под ней виджет останавливается, рядом — доходит до верха', () => {
    const result = compact([
      { id: 'pinned', x: 0, y: 3, w: 2, h: 1, static: true },
      { id: 'under', x: 0, y: 6, w: 2, h: 1 },
      { id: 'beside', x: 2, y: 6, w: 2, h: 1 },
    ], 'vertical')

    expect(result).toContainEqual({ id: 'pinned', x: 0, y: 3, w: 2, h: 1, static: true })
    expect(result.find(item => item.id === 'under')?.y).toBe(4)
    expect(result.find(item => item.id === 'beside')?.y).toBe(0)
  })

  it('режим none оставляет координаты как есть', () => {
    const layout: GrDashboardLayout = [{ id: 'a', x: 0, y: 7, w: 2, h: 1 }]

    expect(compact(layout, 'none')).toEqual(layout)
  })
})

describe('compact: horizontal', () => {
  it('придвигает виджеты к левому краю, не оставляя горизонтальных дыр', () => {
    const result = compact([
      { id: 'a', x: 4, y: 0, w: 2, h: 1 },
      { id: 'b', x: 9, y: 0, w: 2, h: 1 },
      { id: 'c', x: 7, y: 1, w: 3, h: 1 },
    ], 'horizontal')

    expect(result).toEqual([
      { id: 'a', x: 0, y: 0, w: 2, h: 1 },
      { id: 'b', x: 2, y: 0, w: 2, h: 1 },
      { id: 'c', x: 0, y: 1, w: 3, h: 1 },
    ])
  })

  it('не меняет строки корректной раскладки — вертикальная дыра остаётся', () => {
    const result = compact([
      { id: 'a', x: 3, y: 0, w: 2, h: 1 },
      { id: 'b', x: 5, y: 4, w: 2, h: 1 },
    ], 'horizontal')

    expect(result.map(item => item.y)).toEqual([0, 4])
  })

  it('идемпотентна', () => {
    const layout: GrDashboardLayout = [
      { id: 'a', x: 4, y: 0, w: 2, h: 2 },
      { id: 'b', x: 1, y: 1, w: 2, h: 1 },
      { id: 'c', x: 8, y: 3, w: 4, h: 1 },
    ]
    const once = compact(layout, 'horizontal')

    expect(compact(once, 'horizontal')).toEqual(once)
  })

  it('разводит пересечения вниз, а не вправо: правый край недосягаем по определению', () => {
    const result = compact([
      { id: 'a', x: 0, y: 0, w: 3, h: 2 },
      { id: 'b', x: 1, y: 1, w: 3, h: 2 },
      { id: 'c', x: 2, y: 0, w: 3, h: 2 },
    ], 'horizontal')

    expect(hasOverlap(result)).toBe(false)
    // Ни один не уехал правее, чем стоял: развели строками.
    for (const item of result) expect(item.x).toBeLessThanOrEqual(2)
  })

  it('не двигает статику: слева от неё виджет останавливается, в соседней строке — доходит до края', () => {
    const result = compact([
      { id: 'pinned', x: 3, y: 0, w: 2, h: 1, static: true },
      { id: 'behind', x: 7, y: 0, w: 2, h: 1 },
      { id: 'beside', x: 7, y: 1, w: 2, h: 1 },
    ], 'horizontal')

    expect(result).toContainEqual({ id: 'pinned', x: 3, y: 0, w: 2, h: 1, static: true })
    expect(result.find(item => item.id === 'behind')?.x).toBe(5)
    expect(result.find(item => item.id === 'beside')?.x).toBe(0)
  })

  it('не перепрыгивает соседа', () => {
    const result = compact([
      { id: 'near', x: 1, y: 0, w: 2, h: 1 },
      { id: 'far', x: 6, y: 0, w: 2, h: 1 },
    ], 'horizontal')

    expect(result.find(item => item.id === 'near')?.x).toBe(0)
    expect(result.find(item => item.id === 'far')?.x).toBe(2)
  })
})

describe('compact: both', () => {
  it('подтягивает и вверх, и влево', () => {
    const result = compact([
      { id: 'a', x: 5, y: 3, w: 2, h: 1 },
    ], 'both')

    expect(result).toEqual([{ id: 'a', x: 0, y: 0, w: 2, h: 1 }])
  })

  it('сходится там, где одного прохода мало', () => {
    // Слева направо `k` уезжает к краю и освобождает место над `i`, а поднять
    // его может только следующий проход: наивная композиция «вверх, потом
    // влево» оставила бы `i` на строке 1.
    const result = compact([
      { id: 's', x: 0, y: 1, w: 3, h: 1, static: true },
      { id: 'k', x: 3, y: 0, w: 2, h: 1 },
      { id: 'i', x: 3, y: 1, w: 2, h: 1 },
    ], 'both')

    expect(result.find(item => item.id === 'i')).toEqual({ id: 'i', x: 2, y: 0, w: 2, h: 1 })
    expect(result.find(item => item.id === 'k')).toEqual({ id: 'k', x: 0, y: 0, w: 2, h: 1 })
    expect(result).toContainEqual({ id: 's', x: 0, y: 1, w: 3, h: 1, static: true })
  })

  it('идемпотентна и неподвижна: ни подняться, ни уехать влево уже нельзя', () => {
    const layout: GrDashboardLayout = [
      { id: 'a', x: 4, y: 2, w: 2, h: 2 },
      { id: 'b', x: 1, y: 5, w: 3, h: 1 },
      { id: 'c', x: 7, y: 0, w: 2, h: 3 },
      { id: 'd', x: 0, y: 1, w: 1, h: 1, static: true },
    ]
    const once = compact(layout, 'both')

    expect(compact(once, 'both')).toEqual(once)
    expect(canFloat(once, 'x')).toBe(false)
    expect(canFloat(once, 'y')).toBe(false)
  })

  it('перепаковки не делает: дыра, до которой не доехать по прямой, остаётся', () => {
    // Ячейка (3, 1) свободна, и занять её некому: `n` упирается влево в статику
    // и вверх в `m`, а `u` шире оставшегося промежутка. Виджет едет только по
    // прямой свободной дорожке — резать и перекладывать раскладку пакет не берётся.
    const result = compact([
      { id: 's', x: 0, y: 0, w: 1, h: 1, static: true },
      { id: 'm', x: 1, y: 0, w: 3, h: 1 },
      { id: 't', x: 0, y: 1, w: 1, h: 1, static: true },
      { id: 'n', x: 1, y: 1, w: 2, h: 1 },
      { id: 'u', x: 0, y: 2, w: 4, h: 1 },
    ], 'both')

    expect(result.find(item => item.id === 'n')).toEqual({ id: 'n', x: 1, y: 1, w: 2, h: 1 })
    expect(result.find(item => item.id === 'u')).toEqual({ id: 'u', x: 0, y: 2, w: 4, h: 1 })
  })

  it('не двигает статику', () => {
    const result = compact([
      { id: 'pinned', x: 4, y: 2, w: 2, h: 1, static: true },
      { id: 'free', x: 8, y: 5, w: 2, h: 1 },
    ], 'both')

    expect(result).toContainEqual({ id: 'pinned', x: 4, y: 2, w: 2, h: 1, static: true })
    expect(result.find(item => item.id === 'free')).toEqual({ id: 'free', x: 0, y: 0, w: 2, h: 1 })
  })
})

describe('compact: инварианты на всех четырёх режимах', () => {
  const MODES: GrDashboardCompaction[] = ['vertical', 'horizontal', 'both', 'none']

  it.each(MODES)('режим %s отдаёт канонический порядок и не теряет виджеты', (mode) => {
    const layout = randomLayout(7, 11)
    const result = compact(layout, mode)

    expect(result).toEqual(sortLayout(result))
    expect(result.map(item => item.id).sort()).toEqual(layout.map(item => item.id).sort())
  })

  it.each(['vertical', 'horizontal', 'both'] as GrDashboardCompaction[])(
    'режим %s идемпотентен и разводит пересечения на полусотне случайных раскладок',
    (mode) => {
      for (let seed = 1; seed <= 50; seed += 1) {
        const layout = randomLayout(6 + (seed % 5), seed)
        const once = compact(layout, mode)

        expect(hasOverlap(once)).toBe(false)
        expect(compact(once, mode)).toEqual(once)
        expect(once.map(item => item.id).sort()).toEqual(layout.map(item => item.id).sort())
      }
    },
  )
})

describe('resolveCollisions', () => {
  it('толкает столкнувшегося вниз', () => {
    const result = resolveCollisions([
      { id: 'moved', x: 0, y: 0, w: 2, h: 2 },
      { id: 'other', x: 0, y: 1, w: 2, h: 2 },
    ], 'moved')

    expect(result?.find(item => item.id === 'other')?.y).toBe(2)
    expect(hasOverlap(result ?? [])).toBe(false)
  })

  it('распространяет толчок по цепочке', () => {
    const result = resolveCollisions([
      { id: 'moved', x: 0, y: 0, w: 2, h: 2 },
      { id: 'b', x: 0, y: 1, w: 2, h: 1 },
      { id: 'c', x: 0, y: 2, w: 2, h: 1 },
    ], 'moved')

    expect(hasOverlap(result ?? [])).toBe(false)
    expect(result?.find(item => item.id === 'c')?.y).toBe(3)
  })

  it('отказывает, когда перемещение упирается в статику', () => {
    const result = resolveCollisions([
      { id: 'moved', x: 0, y: 0, w: 2, h: 2 },
      { id: 'pinned', x: 0, y: 1, w: 2, h: 2, static: true },
    ], 'moved')

    expect(result).toBeNull()
  })

  it('отказывает при preventCollision', () => {
    const result = resolveCollisions([
      { id: 'moved', x: 0, y: 0, w: 2, h: 2 },
      { id: 'other', x: 0, y: 1, w: 2, h: 2 },
    ], 'moved', { preventCollision: true })

    expect(result).toBeNull()
  })

  it('отказывает, когда толчок по цепочке упирается в статику', () => {
    const result = resolveCollisions([
      { id: 'moved', x: 0, y: 0, w: 2, h: 2 },
      { id: 'b', x: 0, y: 1, w: 2, h: 1 },
      { id: 'pinned', x: 0, y: 2, w: 2, h: 1, static: true },
    ], 'moved')

    expect(result).toBeNull()
  })

  it('без пересечений возвращает ту же раскладку', () => {
    const layout: GrDashboardLayout = [
      { id: 'moved', x: 0, y: 0, w: 2, h: 1 },
      { id: 'other', x: 2, y: 0, w: 2, h: 1 },
    ]

    expect(resolveCollisions(layout, 'moved')).toEqual(layout)
  })
})
