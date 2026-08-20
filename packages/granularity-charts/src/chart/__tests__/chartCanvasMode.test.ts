import { describe, expect, it } from 'vitest'

import { drawnVertices, GR_CHART_CANVAS_THRESHOLD, shouldUseCanvas } from '../chartCanvasMode'
import type { NormalizedSeries } from '../chartModel'

/**
 * Граница между рендерерами считается по **нарисованным вершинам**, а не по
 * суммарным точкам. Прореживание режет каждый ряд по отдельности, поэтому
 * «сколько точек пришло» о цене отрисовки не говорит ничего.
 */
function series(count: number, points: number): NormalizedSeries[] {
  return Array.from({ length: count }, (_, s) => ({
    id: `s${s}`,
    points: Array.from({ length: points }, (_, i) => ({ x: i, y: i, sourceIndex: i })),
  })) as unknown as NormalizedSeries[]
}

describe('выбор рендерера', () => {
  it('считает вершины по всем рядам', () => {
    expect(drawnVertices(series(20, 2400))).toBe(48_000)
    expect(drawnVertices(series(1, 2400))).toBe(2400)
    expect(drawnVertices([])).toBe(0)
  })

  /**
   * Ключевой случай: один длинный ряд прореживается до 2400 вершин и рисуется
   * в SVG за миллисекунду. Считай порог по точкам — холст включился бы зря.
   */
  it('один прорежённый ряд холста не требует', () => {
    expect(shouldUseCanvas(series(1, 2400), GR_CHART_CANVAS_THRESHOLD)).toBe(false)
  })

  it('двадцать таких же рядов — требуют', () => {
    expect(shouldUseCanvas(series(20, 2400), GR_CHART_CANVAS_THRESHOLD)).toBe(true)
  })

  it('порог у самой границы не срабатывает, за ней — срабатывает', () => {
    expect(shouldUseCanvas(series(10, 2400), 24_000)).toBe(false)
    expect(shouldUseCanvas(series(10, 2401), 24_000)).toBe(true)
  })

  /** Так холст отключает потребитель, которому он не нужен ни при каких данных. */
  it('нулевой и отрицательный порог выключают холст совсем', () => {
    expect(shouldUseCanvas(series(50, 5000), 0)).toBe(false)
    expect(shouldUseCanvas(series(50, 5000), -1)).toBe(false)
  })
})
