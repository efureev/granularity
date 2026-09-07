import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { describe, expect, it } from 'vitest'

import GrSlider from '../GrSlider.vue'

function marks(wrapper: ReturnType<typeof mount>) {
  return wrapper.findAll('[data-gr-slider-mark-label]')
}

function thumbs(wrapper: ReturnType<typeof mount>) {
  return wrapper.findAll('[data-gr-slider-thumb]')
}

describe('GrSlider — слот метки', () => {
  it('без слота подпись деления остаётся текстом', () => {
    const wrapper = mount(GrSlider, {
      props: { modelValue: 50, marks: { 0: 'мин', 100: 'макс' } },
    })

    expect(marks(wrapper).map(node => node.text())).toEqual(['мин', 'макс'])
  })

  it('слот получает значение, подпись и положение', () => {
    const wrapper = mount(GrSlider, {
      props: { modelValue: 50, min: 0, max: 100, marks: { 25: 'четверть' } },
      slots: {
        mark: `<template #mark="{ value, label, percent }">
          <i :data-value="value" :data-percent="percent">{{ label }}</i>
        </template>`,
      },
    })

    const node = wrapper.get('[data-value]')
    expect(node.attributes('data-value')).toBe('25')
    expect(node.attributes('data-percent')).toBe('25')
    expect(node.text()).toBe('четверть')
  })

  it('active отмечает пройденные деления', () => {
    const wrapper = mount(GrSlider, {
      props: { modelValue: 50, marks: [0, 50, 100] },
      slots: {
        mark: '<template #mark="{ value, active }"><i :data-value="value" :data-active="active" /></template>',
      },
    })

    expect(wrapper.findAll('[data-value]').map(n => n.attributes('data-active')))
      .toEqual(['true', 'true', 'false'])
  })

  it('у диапазона пройденным считается участок между бегунками', () => {
    const wrapper = mount(GrSlider, {
      props: { modelValue: [40, 60], range: true, marks: [0, 50, 100] },
      slots: {
        mark: '<template #mark="{ value, active }"><i :data-value="value" :data-active="active" /></template>',
      },
    })

    // Деление слева от первого бегунка пройденным не является: заливка у
    // диапазона идёт между ручками, а не от нуля.
    expect(wrapper.findAll('[data-value]').map(n => n.attributes('data-active')))
      .toEqual(['false', 'true', 'false'])
  })
})

describe('GrSlider — слот бегунка', () => {
  it('без слота ручка пуста', () => {
    const wrapper = mount(GrSlider, { props: { modelValue: 50 } })

    expect(thumbs(wrapper)[0].text()).toBe('')
  })

  it('слот получает индекс, значение и положение', () => {
    const wrapper = mount(GrSlider, {
      props: { modelValue: [20, 80], range: true },
      slots: {
        thumb: '<template #thumb="{ index, value, percent }"><i :data-index="index" :data-percent="percent">{{ value }}</i></template>',
      },
    })

    const nodes = wrapper.findAll('[data-index]')
    expect(nodes.map(n => n.attributes('data-index'))).toEqual(['0', '1'])
    expect(nodes.map(n => n.text())).toEqual(['20', '80'])
    expect(nodes[1].attributes('data-percent')).toBe('80')
  })

  it('active идёт за фокусом, как и тултип', async () => {
    const wrapper = mount(GrSlider, {
      props: { modelValue: 50 },
      slots: {
        thumb: '<template #thumb="{ active }"><i :data-active="active" /></template>',
      },
    })

    expect(wrapper.get('[data-active]').attributes('data-active')).toBe('false')

    await thumbs(wrapper)[0].trigger('focus')
    await nextTick()
    expect(wrapper.get('[data-active]').attributes('data-active')).toBe('true')
  })

  it('тултип остаётся при заданном слоте', () => {
    const wrapper = mount(GrSlider, {
      props: { modelValue: 50, showTooltip: 'always' },
      slots: { thumb: '<template #thumb><i data-own /></template>' },
    })

    // Значок в ручке не должен стоить потребителю подсказки со значением.
    expect(wrapper.find('[data-own]').exists()).toBe(true)
    expect(wrapper.get('[data-gr-slider-tooltip]').text()).toBe('50')
  })

  it('слот не трогает виджетный контракт ручки', () => {
    const wrapper = mount(GrSlider, {
      props: { modelValue: 50, ariaLabel: 'Громкость' },
      slots: { thumb: '<template #thumb><i data-own /></template>' },
    })
    const thumb = thumbs(wrapper)[0]

    expect(thumb.attributes('role')).toBe('slider')
    expect(thumb.attributes('tabindex')).toBe('0')
    expect(thumb.attributes('aria-valuenow')).toBe('50')
    expect(thumb.attributes('aria-label')).toBe('Громкость')
  })
})

describe('GrSlider — ручка центрирует содержимое слота', () => {
  it('центрирование заложено в саму ручку, а не в разметку потребителя', () => {
    const wrapper = mount(GrSlider, { props: { modelValue: 50 } })
    const classes = wrapper.findAll('[data-gr-slider-thumb]')[0].classes()

    // Без этого содержимое слота прижималось бы к верхнему левому углу круга,
    // и центрировать его пришлось бы каждому потребителю.
    expect(classes).toContain('inline-flex')
    expect(classes).toContain('items-center')
    expect(classes).toContain('justify-center')
  })
})
