import { describe, expect, it } from 'vitest'

import { countUpFrame, easeOutCubic } from '../countUp'

describe('easeOutCubic', () => {
  it('идёт от нуля к единице и не выходит за границы', () => {
    expect(easeOutCubic(0)).toBe(0)
    expect(easeOutCubic(1)).toBe(1)
    expect(easeOutCubic(-1)).toBe(0)
    expect(easeOutCubic(2)).toBe(1)
  })

  it('быстрый старт, мягкая остановка', () => {
    // К середине перехода пройдено больше половины пути — иначе это не ease-out.
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5)
    expect(easeOutCubic(0.25)).toBeLessThan(easeOutCubic(0.75))
  })
})

describe('countUpFrame', () => {
  it('первый кадр — от начального значения, последний — ровно конечное', () => {
    expect(countUpFrame(0, 1000, 0, 600)).toBe(0)
    expect(countUpFrame(0, 1000, 600, 600)).toBe(1000)
    // Приближение не имеет права оставить показатель в 999.9999.
    expect(countUpFrame(0, 1000, 5000, 600)).toBe(1000)
  })

  it('кадры не выходят за пределы перехода и монотонны', () => {
    const frames = [0, 100, 200, 300, 400, 500].map(ms => countUpFrame(200, 800, ms, 600))

    expect(frames[0]).toBe(200)
    for (let i = 1; i < frames.length; i++)
      expect(frames[i]).toBeGreaterThanOrEqual(frames[i - 1])

    expect(Math.max(...frames)).toBeLessThanOrEqual(800)
  })

  it('идёт и вниз: значение может уменьшаться', () => {
    expect(countUpFrame(1000, 400, 300, 600)).toBeLessThan(1000)
    expect(countUpFrame(1000, 400, 300, 600)).toBeGreaterThan(400)
  })

  it('округляет до precision: без этого кадр показывал бы 1283.6666666666667', () => {
    expect(Number.isInteger(countUpFrame(0, 1284, 300, 600))).toBe(true)
    expect(countUpFrame(0, 12.84, 300, 600, 2).toString()).toMatch(/^\d+(\.\d{1,2})?$/)
  })

  it('нулевая длительность отдаёт конечное значение сразу', () => {
    expect(countUpFrame(0, 1000, 0, 0)).toBe(1000)
    expect(countUpFrame(0, 1000, 0, -1)).toBe(1000)
  })
})
