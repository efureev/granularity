import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import { describe, expect, it } from 'vitest'

import GrCollapse from '../components/GrCollapse/GrCollapse.vue'
import GrCollapseItem from '../components/GrCollapse/GrCollapseItem.vue'
import GrDataTable from '../components/GrDataTable/GrDataTable.vue'
import GrDropdownMenuItem from '../components/GrDropdownMenu/GrDropdownMenuItem.vue'
import GrRadioGroup from '../components/GrRadioGroup/GrRadioGroup.vue'
import GrTabs from '../components/GrTabs/GrTabs.vue'

/**
 * Гейт на шесть покомпонентных дефектов доступности, разобранных в `AUDIT.md`.
 * Каждый — самостоятельный, но общее у них одно: разметка обещает поведение,
 * которого в коде нет, и потому дефект не виден ни глазами, ни axe.
 */

type Row = { id: number, name: string }

describe('a11y: роли и клавиатура покомпонентно', () => {
  it('GrDropdownMenuItem объявляет role="menuitem"', () => {
    // Панель `GrDropdown` объявляет `role="menu"`, а это делает всех потомков
    // презентационными: без явной роли скринридер не объявит ни пункт, ни его
    // позицию («2 из 5»). Навигация `GrDropdown` тоже ищет `[role="menuitem"]`.
    const wrapper = mount(GrDropdownMenuItem, { slots: { default: 'Пункт' } })

    expect(wrapper.attributes('role')).toBe('menuitem')
  })

  it('GrTabs держит ровно одну вкладку в таб-порядке даже при неизвестном modelValue', async () => {
    // Roving tabindex обязан всегда иметь ровно один элемент с `0`. Иначе
    // (пустой `modelValue`, асинхронный список, удаление активной вкладки)
    // весь tablist выпадает из таб-порядка — молча и целиком.
    const wrapper = mount(GrTabs, {
      props: {
        modelValue: 'нет-такой-вкладки',
        tabs: [
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
        ],
      },
    })
    await nextTick()

    const tabbable = wrapper.findAll('[role="tab"]').filter(t => t.attributes('tabindex') === '0')
    expect(tabbable, 'ровно одна вкладка с tabindex="0"').toHaveLength(1)
  })

  it('GrCollapse: свёрнутая панель убрана из таб-порядка и дерева доступности', async () => {
    const wrapper = mount(GrCollapse, {
      props: { modelValue: [] },
      slots: {
        default: () => [
          // Ссылка внутри свёрнутой секции не должна ловиться Tab'ом.
          h(GrCollapseItem, { name: 'one', title: 'Секция' }, { default: () => h('a', { href: '#x' }, 'ссылка') }),
        ],
      },
    })
    await nextTick()

    const panel = wrapper.get('[role="region"]')
    // `grid-rows-[0fr]` — визуальное схлопывание: содержимое остаётся
    // фокусируемым, и фокус уезжает в невидимую область нулевой высоты.
    expect(panel.attributes('hidden') !== undefined || panel.attributes('inert') !== undefined).toBe(true)
  })

  it('GrRadioGroup: стрелки переключают выбор внутри группы', async () => {
    const wrapper = mount(GrRadioGroup, {
      props: {
        modelValue: 'a',
        options: [
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
          { value: 'c', label: 'C' },
        ],
      },
    })
    await nextTick()

    const radios = wrapper.findAll('[role="radio"]')
    await radios[0].trigger('keydown', { key: 'ArrowDown' })

    expect(wrapper.emitted('update:modelValue')?.at(-1), 'ArrowDown выбирает следующий').toEqual(['b'])
  })

  it('GrRadioGroup: в таб-порядке ровно один переключатель', async () => {
    const wrapper = mount(GrRadioGroup, {
      props: {
        modelValue: 'b',
        options: [
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
        ],
      },
    })
    await nextTick()

    const tabbable = wrapper.findAll('[role="radio"]').filter(r => r.attributes('tabindex') === '0')
    expect(tabbable, 'roving tabindex: ровно один с 0').toHaveLength(1)
  })

  it('GrDataTable: выбор строк работает без v-model:selected', async () => {
    // `selectable` без `v-model:selected` рисовал чекбоксы, которые кликаются
    // и никогда не отмечаются: внутреннего состояния выбора не было вовсе.
    // Контраст с сортировкой в том же компоненте — у неё uncontrolled-режим есть.
    const rows: Row[] = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]
    const wrapper = mount(GrDataTable<Row>, {
      props: {
        rows,
        columns: [{ key: 'name', label: 'Имя' }],
        rowKey: (row: Row) => row.id,
        selectable: true,
      },
    })
    await nextTick()

    // Проверяем состояние самого компонента (`data-selected` на строке), а не
    // `checked` у элемента: `setValue` ставит его в DOM напрямую и прошёл бы
    // даже на сломанном компоненте.
    await wrapper.findAll('tbody input[type="checkbox"]')[0].setValue(true)
    await nextTick()

    const selectedRows = wrapper.findAll('[data-gr-datatable-row][data-selected="true"]')
    expect(selectedRows, 'строка обязана стать выбранной').toHaveLength(1)
  })
})
