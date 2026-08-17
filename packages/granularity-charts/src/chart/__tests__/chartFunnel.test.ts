import { describe, expect, it } from 'vitest'

import { funnelPath, funnelStages } from '../chartFunnel'

const plot = { x: 0, y: 0, width: 400, height: 300 }

const conversion = [
  { label: 'Зарегистрировались', value: 1000 },
  { label: 'Активировали', value: 400 },
  { label: 'Оплатили', value: 120 },
]

describe('funnelStages', () => {
  it('доли считаются разными знаменателями и на второй ступени совпадают', () => {
    // Именно поэтому обе и нужны: на второй ступени они равны, дальше расходятся,
    // и подпись с одной из них без знаменателя ничего не значит.
    const stages = funnelStages(conversion, { plot })

    expect(stages[1]!.shareFirst).toBeCloseTo(0.4)
    expect(stages[1]!.sharePrev).toBeCloseTo(0.4)
    expect(stages[2]!.shareFirst).toBeCloseTo(0.12)
    expect(stages[2]!.sharePrev).toBeCloseTo(0.3)
  })

  it('у первой ступени доли от предыдущей нет: предыдущей не существует', () => {
    const stages = funnelStages(conversion, { plot })

    expect(stages[0]!.sharePrev).toBeNull()
    expect(stages[0]!.shareFirst).toBe(1)
  })

  it('нулевая первая ступень не даёт деления на ноль', () => {
    const stages = funnelStages([{ label: 'A', value: 0 }, { label: 'Б', value: 5 }], { plot })

    expect(stages[1]!.shareFirst).toBeNull()
    expect(stages[1]!.sharePrev).toBeNull()
  })

  it('ширина пропорциональна значению, а не порядку', () => {
    const stages = funnelStages(conversion, { plot })

    expect(stages[1]!.rect.width / stages[0]!.rect.width).toBeCloseTo(0.4)
  })

  it('нулевая ступень остаётся видимой', () => {
    // «Сюда не дошёл никто» — это результат, а не отсутствие ступени.
    const stages = funnelStages([{ label: 'A', value: 100 }, { label: 'Б', value: 0 }], { plot })

    expect(stages[1]!.rect.width).toBeGreaterThan(0)
  })

  it('рост между ступенями помечается, а не выпрямляется', () => {
    const stages = funnelStages([{ label: 'A', value: 100 }, { label: 'Б', value: 150 }], { plot })

    expect(stages[1]!.rising).toBe(true)
    expect(stages[0]!.rising).toBe(false)
    // Собственная ширина ступени — `from`; `rect` это габарит, и у расширяющейся
    // трапеции он совпадает с выходом, а не со входом.
    expect(stages[1]!.from).toBeGreaterThan(stages[0]!.from)
  })

  it('одна ступень даёт корректную геометрию, а не деление на ноль', () => {
    const stages = funnelStages([{ label: 'Одна', value: 10 }], { plot })

    expect(stages).toHaveLength(1)
    expect(stages[0]!.rect.height).toBe(plot.height)
    expect(stages[0]!.from).toBe(stages[0]!.to)
  })

  it('`shape: bar` и `trapezoid` дают одни и те же значения и доли', () => {
    const bars = funnelStages(conversion, { plot, shape: 'bar' })
    const trapezoids = funnelStages(conversion, { plot, shape: 'trapezoid' })

    expect(bars.map(stage => [stage.value, stage.shareFirst, stage.sharePrev]))
      .toEqual(trapezoids.map(stage => [stage.value, stage.shareFirst, stage.sharePrev]))
  })

  it('полоса не сужается, трапеция сужается к следующей ступени', () => {
    const bar = funnelStages(conversion, { plot, shape: 'bar' })[0]!
    const trapezoid = funnelStages(conversion, { plot, shape: 'trapezoid' })[0]!

    expect(bar.from).toBe(bar.to)
    expect(trapezoid.to).toBeLessThan(trapezoid.from)
  })

  it('последняя трапеция не срезается в точку', () => {
    const last = funnelStages(conversion, { plot }).at(-1)!

    expect(last.to).toBe(last.from)
  })

  it('горизонталь меняет местами длину и поперечник', () => {
    const stage = funnelStages(conversion, { plot, orientation: 'horizontal' })[0]!

    expect(stage.rect.width).toBeCloseTo(plot.width / 3)
    expect(stage.rect.height).toBe(plot.height)
  })

  it('зазор съедается изнутри ступени', () => {
    const withGap = funnelStages(conversion, { plot, gap: 12 })[0]!

    expect(withGap.rect.height).toBe(plot.height / 3 - 12)
  })

  it('пустой вход даёт пустой список', () => {
    expect(funnelStages([], { plot })).toEqual([])
  })

  it('нечисловое значение — ноль, а не `NaN` на всей воронке', () => {
    const stages = funnelStages([{ label: 'A', value: 100 }, { label: 'Б', value: Number.NaN }], { plot })

    expect(stages[1]!.value).toBe(0)
    expect(stages[1]!.rect.width).not.toBeNaN()
  })
})

describe('funnelPath', () => {
  it('трапеция строится четырьмя точками', () => {
    const path = funnelPath(funnelStages(conversion, { plot })[0]!)

    expect(path.match(/[ML] /g)).toHaveLength(4)
    expect(path.endsWith('Z')).toBe(true)
  })

  it('полоса и трапеция дают разные пути при одинаковых значениях', () => {
    const bar = funnelPath(funnelStages(conversion, { plot, shape: 'bar' })[0]!)
    const trapezoid = funnelPath(funnelStages(conversion, { plot })[0]!)

    expect(bar).not.toBe(trapezoid)
  })

  it('горизонтальная ступень сужается вдоль оси X', () => {
    const stage = funnelStages(conversion, { plot, orientation: 'horizontal' })[0]!

    expect(funnelPath(stage, true)).not.toBe(funnelPath(stage, false))
  })

  it('координаты не содержат `NaN` на вырожденном холсте', () => {
    const stages = funnelStages(conversion, { plot: { x: 0, y: 0, width: 0, height: 0 } })

    expect(funnelPath(stages[0]!)).not.toContain('NaN')
  })
})
