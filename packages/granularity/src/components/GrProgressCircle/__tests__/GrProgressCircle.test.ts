import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { describe, expect, it } from 'vitest'

import GrConfigProvider from '../../GrConfigProvider/GrConfigProvider.vue'
import GrProgressCircle from '../GrProgressCircle.vue'

function mountCircle(props: Record<string, unknown> = {}, slots = {}) {
  return mount(GrProgressCircle, { props: { ariaLabel: 'Прогресс', ...props }, slots })
}

function widget(wrapper: ReturnType<typeof mountCircle>) {
  return wrapper.get('[role="progressbar"]')
}

function arcLength(wrapper: ReturnType<typeof mountCircle>): number {
  return Number(wrapper.get('[data-gr-progress-circle-arc]').attributes('stroke-dasharray')!.split(' ')[0])
}

describe('GrProgressCircle', () => {
  it('объявляет себя индикатором и несёт значение', () => {
    const wrapper = mountCircle({ value: 42 })
    const bar = widget(wrapper)

    expect(bar.attributes('aria-valuenow')).toBe('42')
    expect(bar.attributes('aria-valuemin')).toBe('0')
    expect(bar.attributes('aria-valuemax')).toBe('100')
    expect(bar.attributes('aria-label')).toBe('Прогресс')
    // Сама графика от диктора скрыта: значение уже объявлено ролью.
    expect(wrapper.get('svg').attributes('aria-hidden')).toBe('true')
  })

  it('`aria-valuetext` появляется только со своим форматом', () => {
    expect(widget(mountCircle({ value: 42 })).attributes('aria-valuetext')).toBeUndefined()

    const formatted = mountCircle({ value: 3.2, formatValue: (v: number) => `${v} ГБ` })
    expect(widget(formatted).attributes('aria-valuetext')).toBe('3.2 ГБ')
  })

  it('значение клампится и в ARIA, и в геометрии', () => {
    expect(widget(mountCircle({ value: 140 })).attributes('aria-valuenow')).toBe('100')
    expect(widget(mountCircle({ value: -10 })).attributes('aria-valuenow')).toBe('0')
    expect(widget(mountCircle({ value: Number.NaN })).attributes('aria-valuenow')).toBe('0')

    // Ноль — не дуга нулевой длины: при круглом торце она нарисовалась бы точкой.
    expect(mountCircle({ value: 0 }).find('[data-gr-progress-circle-arc]').exists()).toBe(false)
    expect(arcLength(mountCircle({ value: 100 }))).toBeGreaterThan(0)
  })

  it('неизвестный прогресс не объявляет значения', () => {
    const wrapper = mountCircle({ indeterminate: true, value: 42 })

    expect(widget(wrapper).attributes('aria-valuenow')).toBeUndefined()
    expect(widget(wrapper).attributes('aria-valuetext')).toBeUndefined()
    // Атрибут — точка приложения CSS: вращение и ветка `reduce` висят на нём.
    expect(widget(wrapper).attributes('data-gr-progress-circle-indeterminate')).toBe('')
    expect(wrapper.find('[data-gr-progress-circle-arc]').exists()).toBe(true)
  })

  it('«дашборд» рисует другую дугу при том же значении', () => {
    const circle = mountCircle({ value: 100 })
    const dashboard = mountCircle({ value: 100, shape: 'dashboard' })

    expect(arcLength(dashboard)).toBeCloseTo(arcLength(circle) * 0.75, 6)
    expect(dashboard.get('[data-gr-progress-circle]').attributes('data-shape')).toBe('dashboard')
    expect(widget(dashboard).attributes('aria-valuenow')).toBe('100')
  })

  it('`trackless` убирает дорожку, не трогая дугу', () => {
    expect(mountCircle({ value: 40 }).find('[data-gr-progress-circle-track]').exists()).toBe(true)

    const bare = mountCircle({ value: 40, trackless: true })
    expect(bare.find('[data-gr-progress-circle-track]').exists()).toBe(false)
    expect(bare.find('[data-gr-progress-circle-arc]').exists()).toBe(true)
  })

  it('центр пуст, пока его не попросили', () => {
    expect(mountCircle({ value: 40 }).find('[data-gr-progress-circle-center]').exists()).toBe(false)
  })

  it('`showValue` печатает проценты, `formatValue` — свой текст', () => {
    expect(mountCircle({ value: 41.6, showValue: true }).get('[data-gr-progress-circle-value]').text())
      .toBe('42%')

    expect(
      mountCircle({ value: 3.2, showValue: true, formatValue: (v: number) => `${v} ГБ` })
        .get('[data-gr-progress-circle-value]').text(),
    ).toBe('3.2 ГБ')

    // У неизвестного прогресса печатать нечего.
    expect(mountCircle({ indeterminate: true, showValue: true }).find('[data-gr-progress-circle-value]').exists())
      .toBe(false)
  })

  it('иконка итога встаёт на завершении и на ошибке, а не всегда', () => {
    expect(mountCircle({ value: 100, statusIcon: true }).find('[data-gr-progress-circle-status]').exists())
      .toBe(true)
    expect(mountCircle({ value: 40, tone: 'danger', statusIcon: true }).find('[data-gr-progress-circle-status]').exists())
      .toBe(true)
    expect(mountCircle({ value: 40, statusIcon: true }).find('[data-gr-progress-circle-status]').exists())
      .toBe(false)
    // Без пропа завершение остаётся числом.
    expect(mountCircle({ value: 100, showValue: true }).get('[data-gr-progress-circle-value]').text())
      .toBe('100%')
  })

  it('иконка итога сильнее значения, слот сильнее иконки', () => {
    const withIcon = mountCircle({ value: 100, showValue: true, statusIcon: true })
    expect(withIcon.find('[data-gr-progress-circle-status]').exists()).toBe(true)
    expect(withIcon.find('[data-gr-progress-circle-value]').exists()).toBe(false)

    const withSlot = mountCircle(
      { value: 100, showValue: true, statusIcon: true },
      { default: () => 'готово' },
    )
    expect(withSlot.get('[data-gr-progress-circle-center]').text()).toBe('готово')
    expect(withSlot.find('[data-gr-progress-circle-status]').exists()).toBe(false)
  })

  it('пустой слот не съедает центр', () => {
    // Кнопка отмены живёт под `v-if`: пока её нет, в центре обязано остаться значение.
    const wrapper = mountCircle(
      { value: 40, showValue: true },
      { default: () => [] },
    )

    expect(wrapper.get('[data-gr-progress-circle-value]').text()).toBe('40%')
  })

  it('слот получает уже клампнутое значение', () => {
    const wrapper = mountCircle({ value: 140 }, { default: ({ value }: { value: number }) => `${value}` })

    expect(wrapper.get('[data-gr-progress-circle-center]').text()).toBe('100')
  })

  it('интерактив центра лежит вне роли-виджета', () => {
    // Внутри `role="progressbar"` потомки презентационны: кнопка отмены там
    // стала бы `nested-interactive`.
    const wrapper = mountCircle({ value: 40 }, { default: () => h('button', 'Отменить') })

    expect(wrapper.find('button').exists()).toBe(true)
    expect(widget(wrapper).find('button').exists()).toBe(false)
  })

  it('тон и размер доезжают до разметки', () => {
    const wrapper = mountCircle({ value: 40, tone: 'success', size: 'lg' })

    expect(wrapper.get('[data-gr-progress-circle]').attributes('data-tone')).toBe('success')
    expect(wrapper.get('[data-gr-progress-circle-arc]').attributes('stroke'))
      .toContain('--gr-progress-success-bg')
    expect(wrapper.get('[data-gr-progress-circle]').attributes('style')).toContain('6rem')
  })

  it('толщина берётся от размера и перебивается пропом', () => {
    const bySize = Number(mountCircle({ value: 40, size: 'xs' }).get('[data-gr-progress-circle-arc]').attributes('stroke-width'))
    const byProp = Number(mountCircle({ value: 40, size: 'xs', thickness: 4 }).get('[data-gr-progress-circle-arc]').attributes('stroke-width'))

    expect(bySize).toBe(12)
    expect(byProp).toBe(4)
  })

  it('оформление приходит из `GrConfigProvider`, локальный проп сильнее', () => {
    const fromConfig = mount(GrConfigProvider, {
      props: { componentDefaults: { GrProgressCircle: { tone: 'warning', shape: 'dashboard' } } },
      slots: { default: () => h(GrProgressCircle, { value: 40, ariaLabel: 'П' }) },
    })
    expect(fromConfig.get('[data-gr-progress-circle]').attributes('data-tone')).toBe('warning')
    expect(fromConfig.get('[data-gr-progress-circle]').attributes('data-shape')).toBe('dashboard')

    const localWins = mount(GrConfigProvider, {
      props: { componentDefaults: { GrProgressCircle: { tone: 'warning' } } },
      slots: { default: () => h(GrProgressCircle, { value: 40, tone: 'info', ariaLabel: 'П' }) },
    })
    expect(localWins.get('[data-gr-progress-circle]').attributes('data-tone')).toBe('info')
  })
})
