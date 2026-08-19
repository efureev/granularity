import { granularityGlobal } from '@feugene/granularity/testing'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import GrSparkline from '../GrSparkline.vue'

function factory(props: Record<string, unknown> = {}, options: Record<string, unknown> = {}) {
  return mount(GrSparkline, { props: { data: [1, 5, 3, 9], ...props }, global: granularityGlobal(options) })
}

describe('GrSparkline', () => {
  it('это картинка с осмысленным именем, а не приложение', () => {
    const wrapper = factory()
    const label = wrapper.attributes('aria-label')!

    expect(wrapper.attributes('role')).toBe('img')
    expect(label).toContain('rising')
    expect(label).toContain('9')
  })

  it('падение и ровный ряд читаются по-разному', () => {
    expect(factory({ data: [9, 5, 1] }).attributes('aria-label')).toContain('falling')
    expect(factory({ data: [4, 4, 4] }).attributes('aria-label')).toContain('flat')
  })

  it('своё имя сильнее сводки', () => {
    expect(factory({ ariaLabel: 'Выручка' }).attributes('aria-label')).toBe('Выручка')
  })

  it('сводку можно выключить', () => {
    expect(factory({ summary: false }).attributes('aria-label')).toBe('Sparkline')
  })

  it('рамы нет: ни осей, ни легенды, ни поверхности взаимодействия', () => {
    const wrapper = factory()

    expect(wrapper.find('[data-gr-chart-surface]').exists()).toBe(false)
    expect(wrapper.find('[data-gr-chart-legend]').exists()).toBe(false)
    expect(wrapper.findAll('[tabindex]')).toHaveLength(0)
  })

  it('линия защищена от растяжения холста', () => {
    const line = factory().find('[data-gr-sparkline-line]')

    expect(line.attributes('vector-effect')).toBe('non-scaling-stroke')
  })

  it('торцы линии чистые: круглый торец в растянутом холсте даёт линзу', () => {
    const line = factory().find('[data-gr-sparkline-line]')

    expect(line.attributes('stroke-linecap')).toBe('butt')
    expect(line.attributes('stroke-linejoin')).toBe('round')
  })

  it('area добавляет заливку тише линии', () => {
    const wrapper = factory({ variant: 'area' })
    const fill = wrapper.findAll('path')[0]!

    expect(fill.attributes('fill-opacity')).toContain('--gr-sparkline-fill-opacity')
    expect(fill.attributes('d')).toContain('Z')
  })

  it('пропуск рвёт линию, а не соединяет её через ноль', () => {
    const d = factory({ data: [1, 2, null, 3, 4] }).find('[data-gr-sparkline-line]').attributes('d')!

    expect(d.match(/M /g)).toHaveLength(2)
  })

  it('ряд, начинающийся с пропуска, остаётся рядом чисел', () => {
    const wrapper = factory({ data: [null, null, 5, 7] })

    expect(wrapper.attributes('aria-label')).toContain('rising')
  })

  it('единственное значение рисуется плоской линией, а не пустым холстом', () => {
    // Пустой холст читался бы как «нет данных»; одна точка означает другое —
    // «изменений пока нет».
    const d = factory({ data: [42] }).find('[data-gr-sparkline-line]').attributes('d')!

    expect(d).toMatch(/^M 0 [\d.]+ L 100 [\d.]+$/)
  })

  it('вырожденные данные не роняют компонент', () => {
    expect(() => factory({ data: [] })).not.toThrow()
    expect(() => factory({ data: [null, null] })).not.toThrow()
    expect(factory({ data: [] }).attributes('aria-label')).toBe('Sparkline')
  })

})

describe('GrSparkline — прореживание', () => {
  it('длинный ряд не складывает тысячи вершин в холст шириной сто пикселей', () => {
    const wrapper = factory({ data: Array.from({ length: 5000 }, (_, index) => Math.sin(index / 30) * 10 + 20) })
    const d = wrapper.find('path').attributes('d') ?? ''

    // Бюджет — константа от ширины `viewBox`: замера у спарклайна нет вовсе.
    expect((d.match(/L/g) ?? []).length).toBeLessThan(400)

    wrapper.unmount()
  })

  it('короткий ряд рисуется целиком', () => {
    const wrapper = factory({ data: [1, 5, 3, 9, 4] })

    expect((wrapper.find('path').attributes('d')?.match(/L/g) ?? []).length).toBe(4)

    wrapper.unmount()
  })
})
