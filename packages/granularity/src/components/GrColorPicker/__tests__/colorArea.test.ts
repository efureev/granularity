import { describe, expect, it } from 'vitest'

import { colorAreaKeyStep, colorAreaPointAt, colorAreaThumbPosition } from '../colorArea'

const RECT = { left: 100, top: 50, width: 200, height: 100 }

describe('colorAreaThumbPosition', () => {
  it('ставит светлоту сверху вниз: белое вверху, чёрное внизу', () => {
    expect(colorAreaThumbPosition({ s: 0, l: 100 })).toEqual({ x: 0, y: 0 })
    expect(colorAreaThumbPosition({ s: 100, l: 0 })).toEqual({ x: 100, y: 100 })
    expect(colorAreaThumbPosition({ s: 40, l: 60 })).toEqual({ x: 40, y: 40 })
  })

  it('значения за пределами шкалы прижимаются к краю, а не выносят ручку за область', () => {
    expect(colorAreaThumbPosition({ s: -20, l: 140 })).toEqual({ x: 0, y: 0 })
    expect(colorAreaThumbPosition({ s: 180, l: -30 })).toEqual({ x: 100, y: 100 })
  })
})

describe('colorAreaPointAt', () => {
  it('переводит указатель в каналы: вправо — насыщеннее, вниз — темнее', () => {
    expect(colorAreaPointAt({ clientX: 100, clientY: 50 }, RECT)).toEqual({ s: 0, l: 100 })
    expect(colorAreaPointAt({ clientX: 300, clientY: 150 }, RECT)).toEqual({ s: 100, l: 0 })
    expect(colorAreaPointAt({ clientX: 200, clientY: 100 }, RECT)).toEqual({ s: 50, l: 50 })
  })

  it('указатель за границей области прижимается к краю: протягивание уходит за неё постоянно', () => {
    expect(colorAreaPointAt({ clientX: -500, clientY: -500 }, RECT)).toEqual({ s: 0, l: 100 })
    expect(colorAreaPointAt({ clientX: 900, clientY: 900 }, RECT)).toEqual({ s: 100, l: 0 })
  })

  it('область без размеров не роняет счёт: в jsdom и до раскладки высота нулевая', () => {
    expect(colorAreaPointAt({ clientX: 10, clientY: 10 }, { left: 0, top: 0, width: 0, height: 0 }))
      .toEqual({ s: 0, l: 100 })
  })
})

describe('colorAreaKeyStep', () => {
  const point = { s: 50, l: 50 }

  it('горизонталь меняет насыщенность, вертикаль — светлоту, независимо от фокуса', () => {
    expect(colorAreaKeyStep('ArrowRight', point, 'lightness'))
      .toEqual({ point: { s: 51, l: 50 }, axis: 'saturation' })
    expect(colorAreaKeyStep('ArrowLeft', point, 'lightness'))
      .toEqual({ point: { s: 49, l: 50 }, axis: 'saturation' })
    expect(colorAreaKeyStep('ArrowUp', point, 'saturation'))
      .toEqual({ point: { s: 50, l: 51 }, axis: 'lightness' })
    expect(colorAreaKeyStep('ArrowDown', point, 'saturation'))
      .toEqual({ point: { s: 50, l: 49 }, axis: 'lightness' })
  })

  it('крупный шаг и края работают по оси сфокусированного поля: диапазонов здесь два', () => {
    expect(colorAreaKeyStep('PageUp', point, 'saturation'))
      .toEqual({ point: { s: 60, l: 50 }, axis: 'saturation' })
    expect(colorAreaKeyStep('PageUp', point, 'lightness'))
      .toEqual({ point: { s: 50, l: 60 }, axis: 'lightness' })
    expect(colorAreaKeyStep('Home', point, 'saturation'))
      .toEqual({ point: { s: 0, l: 50 }, axis: 'saturation' })
    expect(colorAreaKeyStep('End', point, 'lightness'))
      .toEqual({ point: { s: 50, l: 100 }, axis: 'lightness' })
  })

  it('шаг у края не выходит за шкалу', () => {
    expect(colorAreaKeyStep('ArrowLeft', { s: 0, l: 50 }, 'saturation')?.point).toEqual({ s: 0, l: 50 })
    expect(colorAreaKeyStep('ArrowUp', { s: 50, l: 100 }, 'lightness')?.point).toEqual({ s: 50, l: 100 })
    expect(colorAreaKeyStep('PageDown', { s: 50, l: 4 }, 'lightness')?.point).toEqual({ s: 50, l: 0 })
  })

  it('чужая клавиша не перехватывается: у панели свои Esc и Tab', () => {
    expect(colorAreaKeyStep('Escape', point, 'saturation')).toBeNull()
    expect(colorAreaKeyStep('Tab', point, 'saturation')).toBeNull()
    expect(colorAreaKeyStep('Enter', point, 'lightness')).toBeNull()
  })
})
