import { describe, expect, it } from 'vitest'

import { outputSize } from '../outputSize'

const LANDSCAPE = { sw: 640, sh: 480 }

describe('outputSize', () => {
  it('без запроса отдаёт размер самой области', () => {
    expect(outputSize(LANDSCAPE)).toEqual({ width: 640, height: 480 })
  })

  it('по одной ширине считает высоту из соотношения области', () => {
    // Высота, взятая из исходника, дала бы 800×480 — растяжение на четверть.
    expect(outputSize(LANDSCAPE, { width: 800 })).toEqual({ width: 800, height: 600 })
  })

  it('по одной высоте считает ширину', () => {
    expect(outputSize(LANDSCAPE, { height: 240 })).toEqual({ width: 320, height: 240 })
  })

  it('обе стороны — габарит: кадр вписывается, а не растягивается', () => {
    // 640×480 в бокс 256×256: буквальные 256×256 растянули бы картинку.
    expect(outputSize(LANDSCAPE, { width: 256, height: 256 })).toEqual({ width: 256, height: 192 })
  })

  it('в габарите ограничивает та сторона, которой не хватает', () => {
    expect(outputSize(LANDSCAPE, { width: 1000, height: 240 })).toEqual({ width: 320, height: 240 })
  })

  it('вырожденная область не делит на ноль', () => {
    expect(outputSize({ sw: 0, sh: 0 }, { width: 100 })).toEqual({ width: 100, height: 100 })
  })

  it('размер меньше пикселя округляется до пикселя, а не до нуля', () => {
    expect(outputSize({ sw: 640, sh: 480 }, { height: 0.4 })).toEqual({ width: 1, height: 1 })
  })
})
