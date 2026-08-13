import { describe, expect, it } from 'vitest'

import { GR_CHART_SERIES_COLORS, seriesStyle } from '../chartSeriesStyle'

describe('seriesStyle', () => {
  it('первые пять серий берут пять ролей палитры по порядку', () => {
    for (let i = 0; i < GR_CHART_SERIES_COLORS.length; i++)
      expect(seriesStyle(i).color).toBe(GR_CHART_SERIES_COLORS[i])
  })

  it('шестая серия повторяет цвет, но меняет форму', () => {
    const first = seriesStyle(0)
    const sixth = seriesStyle(5)

    expect(sixth.color).toBe(first.color)
    expect(sixth.shape).not.toBe(first.shape)
  })

  it('штриховка меняется только после исчерпания цветов и форм', () => {
    expect(seriesStyle(24).dash).toBe('none')
    expect(seriesStyle(25).dash).not.toBe('none')
    expect(seriesStyle(25).dashArray).toBeTruthy()
  })

  it('переопределения потребителя сильнее цикла', () => {
    const style = seriesStyle(0, { color: 'tomato', shape: 'diamond' })

    expect(style.color).toBe('tomato')
    expect(style.shape).toBe('diamond')
  })

  it('отрицательный и дробный индекс не роняют палитру', () => {
    expect(seriesStyle(-3).color).toBe(GR_CHART_SERIES_COLORS[0])
    expect(seriesStyle(1.7).color).toBe(GR_CHART_SERIES_COLORS[1])
  })
})
