import { describe, expect, it } from 'vitest'

import { heatmapCells, heatmapColor, heatmapMatrix, heatmapOnDark, heatmapScale } from '../chartHeatmap'

const roles = { low: 'var(--gr-danger)', high: 'var(--gr-chart-1)', mid: 'var(--gr-muted)', empty: 'transparent' }
const plot = { x: 0, y: 0, width: 300, height: 200 }

/** Матрица когорт разрежена по построению: у свежей когорты будущих месяцев нет. */
const cohorts = [
  [100, 62, 41, 28],
  [100, 58, 39],
  [100, 55],
]

describe('heatmapMatrix', () => {
  it('короткие строки дополняются `null` справа, а не нулями', () => {
    expect(heatmapMatrix(cohorts, 4, 3)[2]).toEqual([100, 55, null, null])
  })

  it('недостающие строки тоже появляются', () => {
    expect(heatmapMatrix(cohorts, 4, 5)[4]).toEqual([null, null, null, null])
  })

  it('лишние значения строки отсекаются по числу колонок', () => {
    expect(heatmapMatrix([[1, 2, 3]], 2, 1)[0]).toEqual([1, 2])
  })

  it('`NaN` — это отсутствие ячейки, а не ноль', () => {
    expect(heatmapMatrix([[Number.NaN]], 1, 1)[0]).toEqual([null])
  })
})

describe('heatmapScale', () => {
  it('`null` в домен не входит и шкалу к нулю не тянет', () => {
    const scale = heatmapScale([[50, 80, null]])

    expect(scale.domain).toEqual([50, 80])
  })

  it('заданный домен сильнее данных', () => {
    expect(heatmapScale([[50, 80]], { domain: [0, 100] }).domain).toEqual([0, 100])
  })

  it('все значения равны — шкала не вырождается в деление на ноль', () => {
    const scale = heatmapScale([[7, 7, 7]])

    expect(scale.fractionOf(7)).toBe(0.5)
  })

  it('`steps: 0` и `steps: 5` дают одинаковые края и разные середины', () => {
    const continuous = heatmapScale([[0, 100]], { steps: 0 })
    const stepped = heatmapScale([[0, 100]], { steps: 5 })

    expect(stepped.fractionOf(0)).toBe(continuous.fractionOf(0))
    expect(stepped.fractionOf(100)).toBe(continuous.fractionOf(100))
    expect(stepped.fractionOf(40)).not.toBe(continuous.fractionOf(40))
  })

  it('расходящаяся шкала симметрична относительно середины', () => {
    const scale = heatmapScale([[-20, 60]], { kind: 'diverging', midpoint: 0, steps: 0 })

    expect(scale.fractionOf(30)).toBe(-scale.fractionOf(-30)!)
    expect(scale.fractionOf(0)).toBe(0)
  })

  it('расходящаяся шкала нормируется на больший из отступов от середины', () => {
    // Иначе одна сторона упиралась бы в полную насыщенность раньше другой, и
    // симметрия существовала бы только на симметричных данных.
    const scale = heatmapScale([[-20, 60]], { kind: 'diverging', steps: 0 })

    expect(scale.fractionOf(60)).toBe(1)
    expect(scale.fractionOf(-20)).toBeCloseTo(-1 / 3)
  })

  it('значение за пределами домена зажимается, а не уходит за единицу', () => {
    const scale = heatmapScale([[0, 100]], { domain: [0, 50], steps: 0 })

    expect(scale.fractionOf(500)).toBe(1)
  })

  it('`null` даёт `null`, а не ноль', () => {
    expect(heatmapScale([[0, 100]]).fractionOf(null)).toBeNull()
  })

  it('границы ступеней описывают шкалу целиком', () => {
    expect(heatmapScale([[0, 100]], { steps: 4 }).thresholds).toEqual([0, 25, 50, 75, 100])
  })

  it('пустая матрица даёт рабочую шкалу, а не падение', () => {
    expect(heatmapScale([]).domain).toEqual([0, 1])
  })
})

describe('heatmapColor', () => {
  it('отсутствующая ячейка не заливается вовсе', () => {
    expect(heatmapColor(null, roles)).toBe('transparent')
  })

  it('минимум шкалы всё же виден — иначе он неотличим от пустой ячейки', () => {
    const color = heatmapColor(0, roles)

    expect(color).toContain('color-mix')
    expect(color).not.toContain('0%')
  })

  it('доля растёт вместе с примесью роли', () => {
    const share = (fraction: number) => Number(heatmapColor(fraction, roles).match(/(\d+)%/)![1])

    expect(share(1)).toBeGreaterThan(share(0.5))
    expect(share(1)).toBe(100)
  })

  it('расходящаяся шкала берёт разные роли по сторонам от середины', () => {
    expect(heatmapColor(-0.5, roles, 'diverging')).toContain('--gr-danger')
    expect(heatmapColor(0.5, roles, 'diverging')).toContain('--gr-chart-1')
    expect(heatmapColor(0, roles, 'diverging')).toBe('var(--gr-muted)')
  })
})

describe('heatmapOnDark', () => {
  it('светлая подпись нужна только на насыщенной заливке', () => {
    expect(heatmapOnDark(0.2)).toBe(false)
    expect(heatmapOnDark(0.9)).toBe(true)
  })

  it('сторона отклонения роли не играет — важна насыщенность', () => {
    expect(heatmapOnDark(-0.9)).toBe(true)
  })

  it('у отсутствующей ячейки подписи нет вовсе', () => {
    expect(heatmapOnDark(null)).toBe(false)
  })
})

describe('heatmapCells', () => {
  const matrix = heatmapMatrix(cohorts, 4, 3)
  const scale = heatmapScale(matrix)

  it('ячеек ровно колонки × строки, включая отсутствующие', () => {
    expect(heatmapCells(matrix, scale, { plot, columns: 4, rows: 3 })).toHaveLength(12)
  })

  it('сетка упирается в края области построения', () => {
    const cells = heatmapCells(matrix, scale, { plot, columns: 4, rows: 3 })
    const last = cells[cells.length - 1]!

    expect(cells[0]!.rect.x).toBe(plot.x)
    expect(last.rect.x + last.rect.width).toBeCloseTo(plot.x + plot.width)
  })

  it('зазор съедается изнутри ячейки, а не добавляется к сетке', () => {
    // Иначе последняя колонка оказалась бы уже остальных.
    const withGap = heatmapCells(matrix, scale, { plot, columns: 4, rows: 3, gap: 4 })
    const last = withGap[withGap.length - 1]!

    expect(withGap[0]!.rect.width).toBe(300 / 4 - 4)
    expect(last.rect.x + last.rect.width + 2).toBeCloseTo(plot.x + plot.width)
  })

  it('отсутствующая ячейка приходит с `null`, а не с нулём', () => {
    const cells = heatmapCells(matrix, scale, { plot, columns: 4, rows: 3 })
    const missing = cells.find(cell => cell.x === 3 && cell.y === 2)!

    expect(missing.value).toBeNull()
    expect(missing.fraction).toBeNull()
  })

  it('пустая сетка даёт пустой список, а не деление на ноль', () => {
    expect(heatmapCells([], scale, { plot, columns: 0, rows: 0 })).toEqual([])
  })
})
