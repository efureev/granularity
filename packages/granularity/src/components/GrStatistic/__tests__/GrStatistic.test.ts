import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import GrStatistic from '../GrStatistic.vue'

describe('GrStatistic', () => {
  it('показывает отформатированное значение, подпись и приписки', () => {
    const wrapper = mount(GrStatistic, {
      props: { title: 'Выручка', value: 1234567.5, precision: 2, prefix: '₽', suffix: 'в месяц' },
    })

    expect(wrapper.get('[data-gr-statistic-title]').text()).toBe('Выручка')
    expect(wrapper.get('[data-testid="gr-statistic-value"]').text()).toContain('1 234 567.50')
    expect(wrapper.get('[data-gr-statistic-prefix]').text()).toBe('₽')
    expect(wrapper.get('[data-gr-statistic-suffix]').text()).toBe('в месяц')
  })

  it('строка динамики окрашивается по направлению', () => {
    const up = mount(GrStatistic, { props: { value: 10, trend: 'up', trendText: '+12%' } })
    expect(up.get('[data-testid="gr-statistic-trend"]').classes().join(' ')).toContain('var(--gr-success-text)')
    expect(up.get('[data-testid="gr-statistic-trend"]').html()).toContain('i-lucide-trending-up')

    const down = mount(GrStatistic, { props: { value: 10, trend: 'down', trendText: '-3%' } })
    expect(down.get('[data-testid="gr-statistic-trend"]').classes().join(' ')).toContain('var(--gr-danger-text)')
  })

  it('без trend/trendText строка динамики не рендерится', () => {
    const wrapper = mount(GrStatistic, { props: { value: 10 } })
    expect(wrapper.find('[data-testid="gr-statistic-trend"]').exists()).toBe(false)
  })

  it('loading подменяет значение плейсхолдером', () => {
    const wrapper = mount(GrStatistic, { props: { value: 42, loading: true } })

    expect(wrapper.find('[data-testid="gr-statistic-value"]').exists()).toBe(false)
    const placeholder = wrapper.get('[data-testid="gr-statistic-placeholder"]')
    expect(placeholder.attributes('aria-busy')).toBe('true')
  })

  it('слот по умолчанию заменяет форматированное значение', () => {
    const wrapper = mount(GrStatistic, {
      props: { value: 42 },
      slots: { default: '<span data-testid="custom">почти сорок два</span>' },
    })

    expect(wrapper.get('[data-testid="custom"]').text()).toBe('почти сорок два')
    expect(wrapper.text()).not.toContain('42')
  })

  it('тон меняет цвет значения', () => {
    const wrapper = mount(GrStatistic, { props: { value: 1, tone: 'danger' } })
    expect(wrapper.get('[data-testid="gr-statistic-value"]').html()).toContain('var(--gr-danger-text)')
  })
})
