import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import { announced, granularityGlobal, resetGranularityDom } from '@feugene/granularity/testing'

import type { GrDashboardPaletteItem } from '../grDashboardPaletteStyles'
import GrDashboardPalette from '../GrDashboardPalette.vue'

afterEach(resetGranularityDom)

const items: GrDashboardPaletteItem[] = [
  { id: 'sales', title: 'Продажи', description: 'Выручка по дням', defaultSize: { w: 4, h: 2 } },
  { id: 'traffic', title: 'Трафик', disabled: true },
]

function palette(props: Record<string, unknown> = {}) {
  return mount(GrDashboardPalette, { props: { items, ...props }, global: granularityGlobal() })
}

describe('grDashboardPalette', () => {
  it('каталог объявлен списком с именем', () => {
    const list = palette().find('ul')

    expect(list.exists()).toBe(true)
    expect(list.attributes('aria-label')).toBeTruthy()
    expect(palette().findAll('[data-gr-dashboard-palette-item]')).toHaveLength(2)
  })

  it('добавление — обычная кнопка с именем виджета', async () => {
    const wrapper = palette()
    const button = wrapper.findAll('button')[0]

    expect(button?.attributes('aria-label')).toContain('Продажи')

    await button?.trigger('click')
    expect(wrapper.emitted('add')?.[0]).toEqual([items[0]])
  })

  it('добавление объявляется в живом регионе', async () => {
    const wrapper = palette()
    await wrapper.findAll('button')[0]?.trigger('click')

    expect(await announced()).toContain('Продажи')
  })

  it('выключенный виджет не добавляется', async () => {
    const wrapper = palette()
    await wrapper.findAll('button')[1]?.trigger('click')

    expect(wrapper.emitted('add')).toBeUndefined()
  })

  it('disabled на каталоге гасит все кнопки', async () => {
    const wrapper = palette({ disabled: true })
    await wrapper.findAll('button')[0]?.trigger('click')

    expect(wrapper.emitted('add')).toBeUndefined()
  })

  it('пустой каталог показывает объяснение, а не пустоту', () => {
    const wrapper = mount(GrDashboardPalette, { props: { items: [] }, global: granularityGlobal() })

    expect(wrapper.find('ul').exists()).toBe(false)
    expect(wrapper.text()).toBeTruthy()
  })
})
