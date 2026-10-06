import { mount } from '@vue/test-utils'
import type { Component } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'

import { resetGranularityDom } from '@feugene/granularity/testing'

import GrDatePicker from '../../components/GrDatePicker/GrDatePicker.vue'
import GrDateRangePicker from '../../components/GrDateRangePicker/GrDateRangePicker.vue'
import GrDateTimePicker from '../../components/GrDateTimePicker/GrDateTimePicker.vue'
import GrTimePicker from '../../components/GrTimePicker/GrTimePicker.vue'

afterEach(resetGranularityDom)

/**
 * Поле пикера занимает ширину колонки — как `GrInput` и `GrSelect`.
 *
 * Обёртка триггера была `inline-block` и обжимала поле по его собственной
 * ширине: `style="width:100%"` растягивал корень компонента, а поле внутри
 * оставалось узким, и диапазон со временем обрезался на середине. Раскладки в
 * jsdom нет, поэтому проверяется цепочка, от которой ширина зависит: обёртка
 * блочная во всю ширину, поле — `w-full`.
 */
describe('ширина поля пикера', () => {
  it.each([
    ['GrDatePicker', GrDatePicker, '[data-gr-date-picker-field]'],
    ['GrDateRangePicker', GrDateRangePicker, '[data-gr-date-range-picker-field]'],
    ['GrDateTimePicker', GrDateTimePicker, '[data-gr-date-time-picker-field]'],
    ['GrTimePicker', GrTimePicker, '[data-gr-time-picker-field]'],
  ] as [string, Component, string][])('%s растягивается по колонке', (_name, picker, fieldSelector) => {
    const wrapper = mount(picker, { props: { locale: 'en-US' }, attrs: { style: 'width: 100%' }, attachTo: document.body })
    const trigger = wrapper.get('[data-gr-popover-trigger]')
    const field = wrapper.get(fieldSelector)

    expect(wrapper.attributes('style')).toContain('width: 100%')
    expect(trigger.classes()).toEqual(expect.arrayContaining(['block', 'w-full']))
    expect(trigger.classes()).not.toContain('inline-block')
    expect(field.classes()).toContain('w-full')
    wrapper.unmount()
  })
})
