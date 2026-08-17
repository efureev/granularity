import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { describe, expect, it, vi } from 'vitest'

vi.mock('~icons/lucide/trending-up', () => ({
  default: defineComponent({ name: 'IconTrendingUp', render: () => h('svg', { 'data-icon': 'trending-up' }) }),
}))
vi.mock('~icons/lucide/trending-down', () => ({
  default: defineComponent({ name: 'IconTrendingDown', render: () => h('svg', { 'data-icon': 'trending-down' }) }),
}))
vi.mock('~icons/lucide/minus', () => ({
  default: defineComponent({ name: 'IconMinus', render: () => h('svg', { 'data-icon': 'minus' }) }),
}))

import GrConfigProvider from '../../GrConfigProvider/GrConfigProvider.vue'
import GrDelta from '../GrDelta.vue'

describe('GrDelta', () => {
  it('печатает величину со знаком, приписками и тоном', () => {
    const wrapper = mount(GrDelta, {
      props: { value: 0.004, precision: 3, prefix: '$', locale: 'en-US' },
    })

    expect(wrapper.get('[data-gr-delta-prefix]').text()).toBe('$')
    expect(wrapper.get('[data-gr-delta-value]').text()).toBe('+0.004')
    expect(wrapper.attributes('data-tone')).toBe('success')
    expect(wrapper.classes()).toContain('text-[var(--gr-success-text)]')
  })

  it('падение красится опасностью, минус ставит Intl', () => {
    const wrapper = mount(GrDelta, { props: { value: -12.5, precision: 2, locale: 'en-US' } })

    expect(wrapper.get('[data-gr-delta-value]').text()).toBe('-12.50')
    expect(wrapper.attributes('data-tone')).toBe('danger')
  })

  it('ноль нейтрален и знака не получает', () => {
    const wrapper = mount(GrDelta, { props: { value: 0, locale: 'en-US' } })

    expect(wrapper.get('[data-gr-delta-value]').text()).toBe('0')
    expect(wrapper.attributes('data-tone')).toBe('neutral')
  })

  // `null` — «величины нет», а не «величина равна нулю».
  it('null даёт прочерк без тона, стрелки и приписок', () => {
    const wrapper = mount(GrDelta, {
      props: { value: null, prefix: '$', suffix: '%', showArrow: true },
    })

    expect(wrapper.get('[data-gr-delta-value]').text()).toBe('—')
    expect(wrapper.attributes('data-tone')).toBeUndefined()
    expect(wrapper.find('[data-gr-delta-arrow]').exists()).toBe(false)
    expect(wrapper.find('[data-gr-delta-prefix]').exists()).toBe(false)
    expect(wrapper.find('[data-gr-delta-suffix]').exists()).toBe(false)
    expect(wrapper.classes()).toContain('text-[var(--gr-muted-fg)]')
  })

  it('emptyText перекрывает прочерк', () => {
    const wrapper = mount(GrDelta, { props: { value: null, emptyText: 'нет данных' } })

    expect(wrapper.get('[data-gr-delta-value]').text()).toBe('нет данных')
  })

  // Значение остаётся собой: «−15 %» при падении себестоимости зелёное,
  // но всё ещё минус.
  it('negative-good инвертирует тон, не трогая знак', () => {
    const wrapper = mount(GrDelta, {
      props: { value: -15, polarity: 'negative-good', suffix: '%', locale: 'en-US' },
    })

    expect(wrapper.attributes('data-tone')).toBe('success')
    expect(wrapper.get('[data-gr-delta-value]').text()).toBe('-15')
    expect(wrapper.get('[data-gr-delta-suffix]').text()).toBe('%')
  })

  it('showSign=false убирает плюс, минус оставляет', () => {
    const plus = mount(GrDelta, { props: { value: 10, showSign: false, locale: 'en-US' } })
    expect(plus.get('[data-gr-delta-value]').text()).toBe('10')

    const minus = mount(GrDelta, { props: { value: -10, showSign: false, locale: 'en-US' } })
    expect(minus.get('[data-gr-delta-value]').text()).toBe('-10')
  })

  // Склейка `'+' + value` теряла разряды: строка `'+1,234'` уже не число.
  it('форматирование по локали не теряет разряды', () => {
    const wrapper = mount(GrDelta, { props: { value: 1234567.5, precision: 1, locale: 'en-US' } })

    expect(wrapper.get('[data-gr-delta-value]').text()).toBe('+1,234,567.5')
  })

  it('локаль меняет разделители', () => {
    const wrapper = mount(GrDelta, { props: { value: 1234.5, precision: 1, locale: 'de-DE' } })

    expect(wrapper.get('[data-gr-delta-value]').text()).toBe('+1.234,5')
  })

  it('стрелка декоративна и следует знаку, а не полярности', () => {
    const up = mount(GrDelta, { props: { value: 5, showArrow: true } })
    expect(up.find('svg[data-icon="trending-up"]').exists()).toBe(true)
    expect(up.get('[data-gr-delta-arrow]').attributes('aria-hidden')).toBe('true')

    const down = mount(GrDelta, { props: { value: -5, showArrow: true, polarity: 'negative-good' } })
    expect(down.find('svg[data-icon="trending-down"]').exists()).toBe(true)
    // Тон зелёный, стрелка вниз: величина уменьшилась, и это хорошо.
    expect(down.attributes('data-tone')).toBe('success')

    const flat = mount(GrDelta, { props: { value: 0, showArrow: true } })
    expect(flat.find('svg[data-icon="minus"]').exists()).toBe(true)
  })

  it('без showArrow стрелки нет', () => {
    const wrapper = mount(GrDelta, { props: { value: 5 } })

    expect(wrapper.find('[data-gr-delta-arrow]').exists()).toBe(false)
  })

  it('polarity и emptyText читаются из GrConfigProvider', () => {
    const Harness = defineComponent({
      components: { GrConfigProvider, GrDelta },
      template: `
        <GrConfigProvider :component-defaults="{ GrDelta: { polarity: 'negative-good', emptyText: 'н/д' } }">
          <GrDelta :value="5" data-case="tone" />
          <GrDelta :value="null" data-case="empty" />
        </GrConfigProvider>
      `,
    })

    const wrapper = mount(Harness)
    expect(wrapper.get('[data-case="tone"]').attributes('data-tone')).toBe('danger')
    expect(wrapper.get('[data-case="empty"]').text()).toBe('н/д')
  })
})
