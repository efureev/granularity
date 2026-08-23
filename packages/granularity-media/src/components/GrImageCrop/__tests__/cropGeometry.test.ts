import { describe, expect, it } from 'vitest'

import {
  clampOffset,
  coverScale,
  cropRect,
  offsetBounds,
  viewportFor,
} from '../cropGeometry'

const LANDSCAPE = { width: 1600, height: 900 }
const SQUARE_VIEWPORT = { width: 300, height: 300 }

describe('coverScale', () => {
  it('покрывает окно по узкой стороне, а не вписывает картинку внутрь', () => {
    // Вписывание дало бы 300/1600 и поля сверху и снизу — то есть пустоту в кадре.
    expect(coverScale(LANDSCAPE, SQUARE_VIEWPORT)).toBeCloseTo(300 / 900)
  })

  it('на вырожденном изображении не делит на ноль', () => {
    expect(coverScale({ width: 0, height: 0 }, SQUARE_VIEWPORT)).toBe(1)
  })
})

describe('offsetBounds', () => {
  it('по покрытой стороне запаса нет', () => {
    // Высота покрыта ровно: съехать по вертикали некуда.
    expect(offsetBounds(LANDSCAPE, SQUARE_VIEWPORT, 1).y).toBe(0)
  })

  it('запас растёт вместе с увеличением', () => {
    const atOne = offsetBounds(LANDSCAPE, SQUARE_VIEWPORT, 1)
    const atTwo = offsetBounds(LANDSCAPE, SQUARE_VIEWPORT, 2)

    expect(atTwo.x).toBeGreaterThan(atOne.x)
    expect(atTwo.y).toBeGreaterThan(atOne.y)
  })
})

describe('clampOffset', () => {
  it('подрезает смещение до предела', () => {
    const bounds = offsetBounds(LANDSCAPE, SQUARE_VIEWPORT, 1)
    const clamped = clampOffset({ x: 10_000, y: 10_000 }, LANDSCAPE, SQUARE_VIEWPORT, 1)

    expect(clamped).toEqual({ x: bounds.x, y: bounds.y })
  })

  it('симметричен по знаку', () => {
    const bounds = offsetBounds(LANDSCAPE, SQUARE_VIEWPORT, 1)

    expect(clampOffset({ x: -10_000, y: 0 }, LANDSCAPE, SQUARE_VIEWPORT, 1).x).toBe(-bounds.x)
  })
})

describe('cropRect', () => {
  it('в центре без увеличения берёт середину исходника', () => {
    const rect = cropRect(LANDSCAPE, SQUARE_VIEWPORT, 1, { x: 0, y: 0 })

    // Окно квадратное, изображение шире: в кадр идёт квадрат 900×900 по центру.
    expect(rect.sw).toBeCloseTo(900)
    expect(rect.sh).toBeCloseTo(900)
    expect(rect.sx).toBeCloseTo((1600 - 900) / 2)
    expect(rect.sy).toBeCloseTo(0)
  })

  it('увеличение сокращает захватываемую область', () => {
    const single = cropRect(LANDSCAPE, SQUARE_VIEWPORT, 1, { x: 0, y: 0 })
    const double = cropRect(LANDSCAPE, SQUARE_VIEWPORT, 2, { x: 0, y: 0 })

    expect(double.sw).toBeCloseTo(single.sw / 2)
    expect(double.sh).toBeCloseTo(single.sh / 2)
  })

  it('сдвиг вправо берёт кадр левее — картинка едет за пальцем', () => {
    const centered = cropRect(LANDSCAPE, SQUARE_VIEWPORT, 1, { x: 0, y: 0 })
    const dragged = cropRect(LANDSCAPE, SQUARE_VIEWPORT, 1, { x: 50, y: 0 })

    expect(dragged.sx).toBeLessThan(centered.sx)
  })

  it('никогда не выходит за края исходника — при любых увеличении и сдвиге', () => {
    // Кадр за краем даёт прозрачную полосу в результате: `drawImage` рисует
    // только пересечение, а остаток холста остаётся пустым.
    for (const zoom of [1, 1.3, 2, 3.7, 8]) {
      for (const x of [-5000, -137, 0, 42, 5000]) {
        for (const y of [-5000, -137, 0, 42, 5000]) {
          const rect = cropRect(LANDSCAPE, SQUARE_VIEWPORT, zoom, { x, y })

          expect(rect.sx).toBeGreaterThanOrEqual(-1e-9)
          expect(rect.sy).toBeGreaterThanOrEqual(-1e-9)
          expect(rect.sx + rect.sw).toBeLessThanOrEqual(LANDSCAPE.width + 1e-9)
          expect(rect.sy + rect.sh).toBeLessThanOrEqual(LANDSCAPE.height + 1e-9)
        }
      }
    }
  })
})

describe('viewportFor', () => {
  it('считает высоту от соотношения сторон', () => {
    expect(viewportFor(320, 16 / 9).height).toBeCloseTo(180)
  })

  it('на бессмысленном соотношении отдаёт квадрат вместо бесконечности', () => {
    expect(viewportFor(320, 0)).toEqual({ width: 320, height: 320 })
  })
})

describe('вырожденное окно', () => {
  it('до первого измерения отдаёт пустой кадр, а не бесконечность', () => {
    // `ResizeObserver` приходит после монтирования: до него ширина окна — ноль.
    expect(cropRect(LANDSCAPE, { width: 0, height: 0 }, 1, { x: 0, y: 0 }))
      .toEqual({ sx: 0, sy: 0, sw: 0, sh: 0 })
  })
})
