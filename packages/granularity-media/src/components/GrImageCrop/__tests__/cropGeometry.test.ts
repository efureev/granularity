import { describe, expect, it } from 'vitest'

import {
  clampOffset,
  coverScale,
  cropRect,
  frameFor,
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

describe('кадр в точном соотношении рамки', () => {
  const PHOTO = { width: 1600, height: 1200 }
  const PORTRAIT = { width: 1200, height: 1600 }

  it('рамка доводит измеренное окно до соотношения и накрывает его целиком', () => {
    // Рамка 300×225 с бордером в пиксель: внутри остаётся 298×223, это 1.336, а не 4:3.
    const frame = frameFor({ width: 298, height: 223 }, 4 / 3)

    expect(frame.width / frame.height).toBe(4 / 3)
    expect(frame.width).toBeGreaterThanOrEqual(298)
    expect(frame.height).toBeGreaterThanOrEqual(223)
    // Наименьшая такая рамка: лишнее — доля пикселя по одной оси, не больше.
    expect(Math.min(frame.width - 298, frame.height - 223)).toBe(0)
  })

  it('на бессмысленном соотношении рамка квадратная', () => {
    expect(frameFor({ width: 300, height: 120 }, 0)).toEqual({ width: 300, height: 300 })
    expect(frameFor({ width: 300, height: 120 }, Number.NaN)).toEqual({ width: 300, height: 300 })
  })

  it('без увеличения картинка того же соотношения уходит в кадр целиком — без доли пикселя', () => {
    for (const measured of [{ width: 298, height: 223 }, { width: 667, height: 499.75 }, { width: 318, height: 238.5 }]) {
      const frame = frameFor(measured, 4 / 3)

      expect(cropRect(PHOTO, frame, 1, { x: 0, y: 0 })).toEqual({ sx: 0, sy: 0, sw: 1600, sh: 1200 })
    }

    for (const measured of [{ width: 398, height: 531.33 }, { width: 333, height: 444 }, { width: 667, height: 889.33 }]) {
      const frame = frameFor(measured, 3 / 4)

      expect(cropRect(PORTRAIT, frame, 1, { x: 0, y: 0 })).toEqual({ sx: 0, sy: 0, sw: 1200, sh: 1600 })
    }
  })

  it('захваченная область держит соотношение рамки при любом увеличении и сдвиге', () => {
    const frame = frameFor({ width: 298, height: 223 }, 4 / 3)

    for (const zoom of [1, 1.3, 2, 3.7]) {
      for (const x of [-5000, -37, 0, 42, 5000]) {
        const rect = cropRect(LANDSCAPE, frame, zoom, { x, y: x / 2 })

        expect(rect.sw / rect.sh).toBeCloseTo(4 / 3, 12)
      }
    }
  })

  it('край кадра не уходит за исходник и на шуме деления', () => {
    // Окно 1001.3 на картинке 1000×1000: деление на масштаб и обратно даёт
    // sx = −5.7e-14 и sw = 1000.0000000000001.
    expect(cropRect({ width: 1000, height: 1000 }, { width: 1001.3, height: 1001.3 }, 1, { x: 0, y: 0 }))
      .toEqual({ sx: 0, sy: 0, sw: 1000, sh: 1000 })
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
