import { mount } from '@vue/test-utils'
import axe from 'axe-core'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'

import { granularityGlobal } from '@feugene/granularity/testing'

import type { GrDashboardResponsiveLayout } from '../layout'
import GrDashboard from '../components/GrDashboard/GrDashboard.vue'
import GrDashboardItem from '../components/GrDashboardItem/GrDashboardItem.vue'
import GrDashboardPalette from '../components/GrDashboardPalette/GrDashboardPalette.vue'
import GrDashboardToolbar from '../components/GrDashboardToolbar/GrDashboardToolbar.vue'

/**
 * Гейт axe на самой сетке.
 *
 * Витринный a11y-гейт снимает страницу целиком и до режима редактирования не
 * дотягивается, а интересное у дашборда живёт именно в нём: ручки переноса и
 * растягивания, роли групп, имена виджетов.
 *
 * `color-contrast` выключен, как и в витрине: правилу нужен настоящий рендер,
 * а цвета держат гейты палитры в ядре.
 */

const RULES: axe.RunOptions = {
  rules: { 'color-contrast': { enabled: false } },
  resultTypes: ['violations'],
}

async function violations(root: Element): Promise<string[]> {
  const result = await axe.run(root, RULES)

  return result.violations
    .filter(violation => violation.impact === 'serious' || violation.impact === 'critical')
    .map(violation => `${violation.id}: ${violation.help} (${violation.nodes.length})`)
}

function layout(): GrDashboardResponsiveLayout {
  return {
    lg: [
      { id: 'sales', x: 0, y: 0, w: 6, h: 2 },
      { id: 'traffic', x: 6, y: 0, w: 6, h: 2 },
    ],
  }
}

function dashboard(mode: 'view' | 'edit') {
  const model = ref(layout())

  return defineComponent({
    setup: () => () => h(
      GrDashboard,
      { 'layout': model.value, mode, 'onUpdate:layout': (v: GrDashboardResponsiveLayout) => { model.value = v } },
      () => [
        h(GrDashboardItem, { itemId: 'sales', title: 'Продажи' }, { default: () => 'график' }),
        h(GrDashboardItem, { itemId: 'traffic', title: 'Трафик' }, { default: () => 'график' }),
      ],
    ),
  })
}

describe('a11y', () => {
  it('сетка в режиме просмотра — без нарушений', async () => {
    const wrapper = mount(dashboard('view'), { attachTo: document.body, global: granularityGlobal() })
    await nextTick()

    expect(await violations(wrapper.element as Element)).toEqual([])
  })

  it('сетка в режиме редактирования — ручки переноса и размера без нарушений', async () => {
    const wrapper = mount(dashboard('edit'), { attachTo: document.body, global: granularityGlobal() })
    await nextTick()

    expect(await violations(wrapper.element as Element)).toEqual([])
  })

  it('каталог виджетов — без нарушений', async () => {
    const wrapper = mount(GrDashboardPalette, {
      props: {
        items: [
          { id: 'sales', title: 'Продажи', description: 'Выручка по дням' },
          { id: 'traffic', title: 'Трафик', disabled: true },
        ],
      },
      attachTo: document.body,
      global: granularityGlobal(),
    })
    await nextTick()

    expect(await violations(wrapper.element as Element)).toEqual([])
  })

  it('панель управления — без нарушений', async () => {
    const wrapper = mount(GrDashboardToolbar, {
      props: { mode: 'edit', resettable: true },
      attachTo: document.body,
      global: granularityGlobal(),
    })
    await nextTick()

    expect(await violations(wrapper.element as Element)).toEqual([])
  })
})
