import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import { type ChartData, normalizeChartData } from '../../chart/chartModel'
import { useChartA11y } from '../internal/useChartA11y'

function setup(data: ChartData) {
  const activeIndex = ref<number | null>(null)
  const activeSeriesIndex = ref(0)
  const announced: string[] = []
  const onActivate = vi.fn()

  const api = useChartA11y({
    data: () => data,
    activeIndex,
    activeSeriesIndex,
    setActive: index => (activeIndex.value = index),
    announce: message => announced.push(message),
    describe: (index, seriesIndex) => `точка ${index}, серия ${seriesIndex}`,
    onActivate,
  })

  return { api, activeIndex, activeSeriesIndex, announced, onActivate }
}

function key(name: string): KeyboardEvent {
  return { key: name } as KeyboardEvent
}

const single = normalizeChartData([{ id: 'a', y: [1, 2, 3, 4, 5] }])
const many = normalizeChartData([{ id: 'a', y: [1, 2] }, { id: 'b', y: [3, 4] }])

describe('useChartA11y', () => {
  it('первое нажатие стрелки ставит курсор в начало ряда', () => {
    const { api, activeIndex } = setup(single)

    expect(api.onKeydown(key('ArrowRight'))).toBe(true)
    expect(activeIndex.value).toBe(0)
  })

  it('стрелки двигают активную точку и объявляют её', () => {
    const { api, activeIndex, announced } = setup(single)

    api.onKeydown(key('ArrowRight'))
    api.onKeydown(key('ArrowRight'))

    expect(activeIndex.value).toBe(1)
    expect(announced).toEqual(['точка 0, серия 0', 'точка 1, серия 0'])
  })

  it('на краях ряда курсор не уходит за пределы', () => {
    const { api, activeIndex } = setup(single)

    api.onKeydown(key('Home'))
    api.onKeydown(key('ArrowLeft'))
    expect(activeIndex.value).toBe(0)

    api.onKeydown(key('End'))
    api.onKeydown(key('ArrowRight'))
    expect(activeIndex.value).toBe(4)
  })

  it('PageUp и PageDown ходят крупным шагом, но не меньше точки', () => {
    const { api, activeIndex } = setup(single)

    api.onKeydown(key('Home'))
    api.onKeydown(key('PageDown'))

    expect(activeIndex.value).toBe(1)
  })

  it('вертикальные стрелки меняют серию только когда их больше одной', () => {
    const single1 = setup(single)

    expect(single1.api.onKeydown(key('ArrowDown'))).toBe(false)

    const multi = setup(many)

    multi.api.onKeydown(key('ArrowRight'))
    expect(multi.api.onKeydown(key('ArrowDown'))).toBe(true)
    expect(multi.activeSeriesIndex.value).toBe(1)
    expect(multi.announced.at(-1)).toBe('точка 0, серия 1')
  })

  it('смена серии по кругу', () => {
    const { api, activeSeriesIndex } = setup(many)

    api.onKeydown(key('ArrowRight'))
    api.onKeydown(key('ArrowUp'))

    expect(activeSeriesIndex.value).toBe(1)
  })

  it('Enter активирует точку, но только когда она есть', () => {
    const { api, onActivate } = setup(single)

    expect(api.onKeydown(key('Enter'))).toBe(false)
    expect(onActivate).not.toHaveBeenCalled()

    api.onKeydown(key('ArrowRight'))
    expect(api.onKeydown(key('Enter'))).toBe(true)
    expect(onActivate).toHaveBeenCalledWith(0)
  })

  it('Escape снимает активную точку', () => {
    const { api, activeIndex } = setup(single)

    api.onKeydown(key('ArrowRight'))
    expect(api.onKeydown(key('Escape'))).toBe(true)
    expect(activeIndex.value).toBeNull()
  })

  it('чужие клавиши не перехватываются — Tab обязан уводить фокус', () => {
    const { api } = setup(single)

    expect(api.onKeydown(key('Tab'))).toBe(false)
    expect(api.onKeydown(key('a'))).toBe(false)
  })

  it('на пустом наборе клавиатура ничего не делает', () => {
    const { api } = setup(normalizeChartData([]))

    expect(api.onKeydown(key('ArrowRight'))).toBe(false)
  })
})
