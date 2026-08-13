import { describe, expect, it } from 'vitest'

import type { GrDashboardResponsiveLayout } from '../layoutModel'
import { layoutsEqual, parseLayout, serializeLayout } from '../layoutSerialize'

const layout: GrDashboardResponsiveLayout = {
  lg: [
    { id: 'a', x: 0, y: 0, w: 6, h: 2, minW: 2 },
    { id: 'b', x: 6, y: 0, w: 6, h: 2, static: true },
  ],
}

describe('serializeLayout и parseLayout', () => {
  it('переживает круг сериализации без потерь', () => {
    expect(parseLayout(serializeLayout(layout))).toEqual(layout)
  })

  it('не бросает на испорченном JSON', () => {
    expect(parseLayout('{ это не json')).toBeNull()
  })

  it('пустой вход означает «раскладки нет»', () => {
    expect(parseLayout(null)).toBeNull()
    expect(parseLayout('')).toBeNull()
  })

  it('чужую версию без migrate отбрасывает', () => {
    expect(parseLayout(serializeLayout(layout, 99))).toBeNull()
  })

  it('чужую версию с migrate отдаёт наверх', () => {
    const migrated = parseLayout(serializeLayout(layout, 99), {
      migrate: (_raw, from) => (from === 99 ? layout : null),
    })

    expect(migrated).toEqual(layout)
  })

  it('выбрасывает записи без обязательных полей, сохраняя остальные', () => {
    const raw = JSON.stringify({
      version: 1,
      layout: { lg: [{ id: 'a', x: 0, y: 0, w: 2, h: 1 }, { x: 1 }, { id: 'c' }] },
    })

    expect(parseLayout(raw)?.lg).toEqual([{ id: 'a', x: 0, y: 0, w: 2, h: 1 }])
  })

  it('раскладку, где испорчено всё, считает нечитаемой', () => {
    const raw = JSON.stringify({ version: 1, layout: { lg: [{ x: 1 }, { id: 'c' }] } })

    expect(parseLayout(raw)).toBeNull()
  })

  it('нераспознаваемую форму отбрасывает', () => {
    expect(parseLayout(JSON.stringify({ version: 1, layout: { lg: 'нет' } }))).toBeNull()
    expect(parseLayout(JSON.stringify({ version: 1, layout: [] }))).toBeNull()
  })
})

describe('layoutsEqual', () => {
  it('сравнивает по составу и координатам', () => {
    expect(layoutsEqual(
      [{ id: 'a', x: 0, y: 0, w: 2, h: 1 }],
      [{ id: 'a', x: 0, y: 0, w: 2, h: 1 }],
    )).toBe(true)

    expect(layoutsEqual(
      [{ id: 'a', x: 0, y: 0, w: 2, h: 1 }],
      [{ id: 'a', x: 1, y: 0, w: 2, h: 1 }],
    )).toBe(false)
  })

  it('разная длина — не равны', () => {
    expect(layoutsEqual([], [{ id: 'a', x: 0, y: 0, w: 1, h: 1 }])).toBe(false)
  })
})
