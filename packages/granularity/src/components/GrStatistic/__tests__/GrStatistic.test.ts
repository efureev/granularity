import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { describe, expect, it } from 'vitest'

import { GRANULARITY_I18N_KEY, type GranularityI18nAdapter } from '../../../i18n/adapter'
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

describe('GrStatistic — доступность динамики и загрузки', () => {
  it('направление тренда доносит скрытая подпись, а не только цвет и иконка', () => {
    const cases = [
      ['up', 'Increase'],
      ['down', 'Decrease'],
      ['flat', 'No change'],
    ] as const

    for (const [trend, label] of cases) {
      const wrapper = mount(GrStatistic, { props: { value: 10, trend, trendText: '+12%' } })
      const hidden = wrapper.get('[data-gr-statistic-trend-label]')

      expect(hidden.text()).toBe(label)
      expect(hidden.classes()).toContain('sr-only')
      // Иконка направления остаётся декоративной: иначе диктор прочитает его дважды.
      expect(wrapper.get('[data-testid="gr-statistic-trend"] .i-lucide-trending-up, [data-testid="gr-statistic-trend"] .i-lucide-trending-down, [data-testid="gr-statistic-trend"] .i-lucide-minus').attributes('aria-hidden')).toBe('true')
    }
  })

  it('подпись направления переживает подмену слота #trend', () => {
    const wrapper = mount(GrStatistic, {
      props: { value: 10, trend: 'down', trendText: '-4%' },
      slots: { trend: '<span>свой блок</span>' },
    })

    expect(wrapper.get('[data-gr-statistic-trend-label]').text()).toBe('Decrease')
    expect(wrapper.get('[data-testid="gr-statistic-trend"]').text()).toContain('свой блок')
  })

  it('без trend скрытой подписи нет — направления не существует', () => {
    const wrapper = mount(GrStatistic, { props: { value: 10, trendText: 'год к году' } })

    expect(wrapper.find('[data-gr-statistic-trend-label]').exists()).toBe(false)
  })

  it('живая область загрузки не молчит', () => {
    const wrapper = mount(GrStatistic, { props: { value: 10, loading: true } })
    const placeholder = wrapper.get('[data-testid="gr-statistic-placeholder"]')

    expect(placeholder.attributes('role')).toBe('status')
    expect(placeholder.text()).toBe('Loading...')
    expect(placeholder.find('.sr-only').exists()).toBe(true)
  })
})

describe('GrStatistic — размеры и локаль', () => {
  it('лестницы кеглей идут от токенов --gr-text-*', () => {
    const xs = mount(GrStatistic, { props: { value: 1, title: 'x', size: 'xs', suffix: '%' } })
    expect(xs.get('[data-gr-statistic-title]').classes()).toContain('text-[length:var(--gr-text-2xs)]')
    expect(xs.get('[data-gr-statistic-suffix]').classes()).toContain('text-[length:var(--gr-text-xs)]')

    const lg = mount(GrStatistic, { props: { value: 1, title: 'x', size: 'lg', suffix: '%' } })
    expect(lg.get('[data-gr-statistic-title]').classes()).toContain('text-[length:var(--gr-text-sm)]')
    expect(lg.get('[data-gr-statistic-suffix]').classes()).toContain('text-[length:var(--gr-text-xl)]')

    expect(xs.html()).not.toMatch(/text-\[\d+px\]/)
    expect(lg.html()).not.toMatch(/text-\[\d+px\]/)
  })

  it('локаль берётся из i18n-адаптера, а проп locale её перебивает', () => {
    const i18n: GranularityI18nAdapter = {
      t: key => key,
      locale: ref('de-DE'),
    }
    const provide = { [GRANULARITY_I18N_KEY as symbol]: i18n }

    const fromAdapter = mount(GrStatistic, { props: { value: 1234567.5, precision: 2 }, global: { provide } })
    expect(fromAdapter.get('[data-testid="gr-statistic-value"]').text()).toBe('1.234.567,50')

    const fromProp = mount(GrStatistic, {
      props: { value: 1234567.5, precision: 2, locale: 'en-US' },
      global: { provide },
    })
    expect(fromProp.get('[data-testid="gr-statistic-value"]').text()).toBe('1,234,567.50')

    const explicit = mount(GrStatistic, {
      props: { value: 1234567.5, precision: 2, groupSeparator: ' ', decimalSeparator: '.' },
      global: { provide },
    })
    expect(explicit.get('[data-testid="gr-statistic-value"]').text()).toBe('1 234 567.50')
  })

  it('без адаптера остаются ручные разделители', () => {
    const wrapper = mount(GrStatistic, { props: { value: 1234567.5, precision: 2 } })

    expect(wrapper.get('[data-testid="gr-statistic-value"]').text()).toBe('1 234 567.50')
  })
})
