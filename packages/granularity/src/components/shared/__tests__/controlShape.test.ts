import { describe, expect, it } from 'vitest'

import { paddingX as inputPaddingX, paddingXClass as inputPaddingXClass } from '../../GrInput/grInputStyles'
import { GR_CONTROL_SHAPES, controlPillPaddingX, controlPillPaddingXClass, controlShapeRadiusClass } from '../controlShape'
import { GR_COMPONENT_SIZES } from '../sizes'

/**
 * Отступ живёт в двух видах: классом (поле без аддонов) и числом (аддоны задают
 * его инлайн-стилем, а тот перекрывает класс). Разъехавшись, они дают поле, у
 * которого текст стоит по-разному в зависимости от наличия аддона, — и увидеть
 * это можно только глазами и только на нужном сочетании пропов.
 */
function utilityToPx(utility: string): number {
  const step = utility.replace('px-', '')
  return Number.parseFloat(step) * 4
}

describe('форма контрола', () => {
  it('обе формы объявлены и у каждой свой радиус', () => {
    expect([...GR_CONTROL_SHAPES]).toEqual(['box', 'pill'])
    expect(new Set(Object.values(controlShapeRadiusClass)).size).toBe(GR_CONTROL_SHAPES.length)
  })

  it('радиусы берутся из токенов, а не из шкалы uno', () => {
    // `rounded-md` это 6px, то есть уже не та ступень: шаги uno сдвинуты
    // относительно шкалы пакета.
    for (const value of Object.values(controlShapeRadiusClass))
      expect(value).toMatch(/^rounded-\[var\(--gr-radius-[a-z]+\)\]$/)
  })

  it('класс и число отступа пилюли — одно значение', () => {
    for (const size of GR_COMPONENT_SIZES) {
      expect(`${utilityToPx(controlPillPaddingXClass[size])}px`, `размер ${size}`)
        .toBe(controlPillPaddingX[size])
    }
  })

  it('отступ пилюли не меньше половины высоты контрола', () => {
    // Дуга пилюли равна половине высоты; отступ меньше неё сажает текст на
    // скругление. Высоты общие у всех полей-коробок: h-7/h-8/h-10/h-11.
    const heights: Record<string, number> = { xs: 28, sm: 32, md: 40, lg: 44 }

    for (const size of GR_COMPONENT_SIZES) {
      expect(Number.parseFloat(controlPillPaddingX[size]), `размер ${size}`)
        .toBeGreaterThanOrEqual(heights[size] / 2)
    }
  })

  it('у GrInput класс и число согласованы в обеих формах', () => {
    for (const shape of GR_CONTROL_SHAPES) {
      for (const size of GR_COMPONENT_SIZES) {
        expect(`${utilityToPx(inputPaddingXClass[shape][size])}px`, `${shape}/${size}`)
          .toBe(inputPaddingX[shape][size])
      }
    }
  })
})
