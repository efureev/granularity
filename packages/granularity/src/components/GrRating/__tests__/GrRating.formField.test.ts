import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'

import GrFormField from '../../GrFormField/GrFormField.vue'
import { resetGranularityDom } from '../../../testing'
import GrRating from '../GrRating.vue'
import type { GrRatingProps } from '../GrRating.vue'

/**
 * Шкала — `div` с ролью, `<label for>` её не именует: без `aria-labelledby`
 * в поле она звучала бы словарным «Rating» вместо подписи.
 */
async function inField(props: Partial<GrRatingProps>) {
  const wrapper = mount(defineComponent({
    render: () => h(GrFormField, { label: 'Оценка отеля' }, { default: () => h(GrRating, { modelValue: 4, ...props }) }),
  }), { attachTo: document.body })
  await nextTick()

  const scale = wrapper.get('[data-testid="gr-rating-scale"]')
  const named = () => (scale.attributes('aria-labelledby')?.split(' ') ?? [])
    .map(id => document.getElementById(id)?.textContent?.trim())

  return { scale, named }
}

afterEach(resetGranularityDom)

describe('GrRating в GrFormField', () => {
  it('шкалу ввода именует подпись поля', async () => {
    const { named } = await inField({})

    expect(named()).toEqual(['Оценка отеля'])
  })

  it('в показе оценка остаётся в имени рядом с подписью поля', async () => {
    const { scale, named } = await inField({ readonly: true })

    expect(scale.attributes('role')).toBe('img')
    expect(named()).toEqual(['Оценка отеля', '4 of 5'])
  })

  it('свой ariaLabel сильнее подписи поля', async () => {
    const { scale } = await inField({ ariaLabel: 'Звёзды' })

    expect(scale.attributes('aria-label')).toBe('Звёзды')
    expect(scale.attributes('aria-labelledby')).toBeUndefined()
  })
})
