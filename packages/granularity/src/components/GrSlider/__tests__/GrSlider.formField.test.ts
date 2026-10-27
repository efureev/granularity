import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'

import GrFormField from '../../GrFormField/GrFormField.vue'
import { resetGranularityDom } from '../../../testing'
import GrSlider from '../GrSlider.vue'
import type { GrSliderProps } from '../GrSlider.vue'

/**
 * `<label for>` поля указывает на бегунок, но `div[role="slider"]` не labelable:
 * по `for` имя до него не доходит. Подпись поля обязана приехать через
 * `aria-labelledby`, а у диапазона — вместе со словом своей границы.
 */
async function inField(props: Partial<GrSliderProps>) {
  const wrapper = mount(defineComponent({
    render: () => h(GrFormField, { label: 'Громкость' }, { default: () => h(GrSlider, { modelValue: 40, ...props }) }),
  }), { attachTo: document.body })
  await nextTick()

  const labelId = wrapper.get('label').attributes('id')!
  const named = (index: number) => {
    const ids = wrapper.findAll('[role="slider"]')[index].attributes('aria-labelledby')?.split(' ') ?? []
    return ids.map(id => document.getElementById(id)?.textContent?.trim())
  }

  return { wrapper, labelId, named }
}

afterEach(resetGranularityDom)

describe('GrSlider в GrFormField', () => {
  it('подпись поля именует бегунок', async () => {
    const { named } = await inField({})

    expect(named(0)).toEqual(['Громкость'])
  })

  it('у диапазона каждый бегунок — подпись поля и слово своей границы', async () => {
    const { named } = await inField({ modelValue: [20, 80], range: true })

    expect(named(0)).toEqual(['Громкость', 'min'])
    expect(named(1)).toEqual(['Громкость', 'max'])
  })

  it('свой ariaLabel сильнее подписи поля', async () => {
    const { wrapper } = await inField({ ariaLabel: 'Звук' })
    const thumb = wrapper.get('[role="slider"]')

    expect(thumb.attributes('aria-label')).toBe('Звук')
    expect(thumb.attributes('aria-labelledby')).toBeUndefined()
  })
})
