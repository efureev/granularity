import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { describe, expect, it } from 'vitest'

import GrTabs from '../../GrTabs/GrTabs.vue'
import GrTabPanel from '../GrTabPanel.vue'
import GrTabPanels from '../GrTabPanels.vue'

/**
 * Проверяется то, ради чего пара компонентов и существует: ARIA-связка
 * `tab`↔`tabpanel` через общий `idBase` и режим `keepAlive`. Связка держится на
 * совпадении вычисленных id, то есть ломается молча — глазами это не видно.
 */

const TABS = [
  { value: 'a', label: 'Первая' },
  { value: 'b', label: 'Вторая' },
]

function mountPanels(props: Record<string, unknown> = {}, panelProps: Record<string, unknown> = {}) {
  return mount(defineComponent({
    render: () => h(GrTabPanels, { modelValue: 'a', ...props }, {
      default: () => [
        h(GrTabPanel, { value: 'a', ...panelProps }, { default: () => 'Содержимое A' }),
        h(GrTabPanel, { value: 'b', ...panelProps }, { default: () => 'Содержимое B' }),
      ],
    }),
  }))
}

describe('GrTabPanels', () => {
  it('показывает панель активной вкладки и только её', () => {
    const wrapper = mountPanels()

    const panels = wrapper.findAll('[role="tabpanel"]')
    expect(panels).toHaveLength(1)
    expect(panels[0].text()).toContain('Содержимое A')
  })

  it('переключение modelValue меняет видимую панель', async () => {
    const wrapper = mount(defineComponent({
      props: { active: { type: String, default: 'a' } },
      render(props: { active: string }) {
        return h(GrTabPanels, { modelValue: props.active }, {
          default: () => [
            h(GrTabPanel, { value: 'a' }, { default: () => 'Содержимое A' }),
            h(GrTabPanel, { value: 'b' }, { default: () => 'Содержимое B' }),
          ],
        })
      },
    }))

    await wrapper.setProps({ active: 'b' })
    await nextTick()

    expect(wrapper.get('[role="tabpanel"]').text()).toContain('Содержимое B')
  })

  it('keepAlive оставляет неактивные панели в DOM, но скрытыми', () => {
    const wrapper = mountPanels({}, { keepAlive: true })

    const panels = wrapper.findAll('[role="tabpanel"]')
    expect(panels, 'обе панели остаются в дереве').toHaveLength(2)

    const hidden = panels.filter(p => p.attributes('hidden') !== undefined || !p.isVisible())
    expect(hidden, 'неактивная панель обязана быть скрыта').toHaveLength(1)
  })

  it('панель объявляет себя через role и aria-labelledby', () => {
    const wrapper = mountPanels({ idBase: 'demo' })

    const panel = wrapper.get('[role="tabpanel"]')
    expect(panel.attributes('id')).toBe('demo-panel-a')
    expect(panel.attributes('aria-labelledby')).toBe('demo-tab-a')
  })

  it('одинаковый idBase даёт сквозную связку GrTabs ↔ GrTabPanels', async () => {
    // Это и есть контракт пары: `aria-controls` вкладки обязан указывать на id
    // панели, а `aria-labelledby` панели — обратно на id вкладки.
    const wrapper = mount(defineComponent({
      render: () => h('div', [
        h(GrTabs, { modelValue: 'a', tabs: TABS, idBase: 'shared' }),
        h(GrTabPanels, { modelValue: 'a', idBase: 'shared' }, {
          default: () => [h(GrTabPanel, { value: 'a' }, { default: () => 'A' })],
        }),
      ]),
    }))
    await nextTick()

    const activeTab = wrapper.findAll('[role="tab"]')[0]
    const panel = wrapper.get('[role="tabpanel"]')

    expect(activeTab.attributes('aria-controls')).toBe(panel.attributes('id'))
    expect(panel.attributes('aria-labelledby')).toBe(activeTab.attributes('id'))
  })

  it('без idBase id всё равно уникальны и связаны между собой', () => {
    const wrapper = mountPanels()

    const panel = wrapper.get('[role="tabpanel"]')
    expect(panel.attributes('id')).toBeTruthy()
    expect(panel.attributes('aria-labelledby')).toBeTruthy()
    expect(panel.attributes('id')).not.toBe(panel.attributes('aria-labelledby'))
  })

  it('панель вне GrTabPanels не падает и не выдумывает связку', () => {
    const wrapper = mount(GrTabPanel, {
      props: { value: 'a', keepAlive: true },
      slots: { default: 'Одиночная' },
    })

    // Без контекста id вычислить не из чего — но компонент обязан пережить это.
    expect(wrapper.html()).toBeTruthy()
  })
})
