import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import GrTreeSections from '../GrTreeSections.vue'

type Item = { id: string, label: string, children?: Item[] }

function data(): Item[] {
  return [
    { id: 'ops', label: 'Операции', children: [
      { id: 'esc', label: 'Эскалации' },
      { id: 'rules', label: 'Регламенты', children: [{ id: 'duty', label: 'Дежурства' }] },
    ] },
    { id: 'billing', label: 'Биллинг', children: [
      { id: 'invoices', label: 'Счета' },
    ] },
  ]
}

function setup(props: Record<string, unknown> = {}) {
  return mount(GrTreeSections<Item>, { props: { data: data(), nodeKey: 'id', ...props } })
}

describe('GrTreeSections: структура', () => {
  it('корень становится заголовком, а не строкой дерева', () => {
    const wrapper = setup()

    const heads = wrapper.findAll('h3')
    expect(heads.map(h => h.text())).toEqual(['Операции', 'Биллинг'])
    // Корень строкой не рендерится: он больше не узел.
    expect(wrapper.findAll('[role="treeitem"]').map(el => el.text())).not.toContain('Операции')
  })

  it('каждая группа — своё дерево со своим именем', () => {
    const wrapper = setup()
    const trees = wrapper.findAll('[role="tree"]')

    // Заголовок между строками одного дерева ломал бы паттерн: `role="tree"`
    // требует, чтобы его детьми были `treeitem`.
    expect(trees).toHaveLength(2)
    expect(trees.map(t => t.attributes('aria-label'))).toEqual(['Операции', 'Биллинг'])
  })

  it('уровень заголовка задаётся под структуру страницы', () => {
    const wrapper = setup({ headingLevel: 2 })

    expect(wrapper.findAll('h2')).toHaveLength(2)
  })

  it('счётчик показывает число узлов первого уровня группы', () => {
    const wrapper = setup({ showCount: true })

    const counts = wrapper.findAll('h3').map(h => h.find('span')?.text())

    expect(counts).toEqual(['2', '1'])
  })

  it('пустой список групп не рендерит ни одной секции', () => {
    const wrapper = setup({ data: [] })

    expect(wrapper.findAll('[data-gr-tree-sections-group]')).toHaveLength(0)
  })

  it('обязательный `data` не массивом — предупреждение', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    mount(GrTreeSections, { props: { data: undefined as never } })

    expect(warn).toHaveBeenCalled()
    expect(warn.mock.calls[0][0]).toContain('data')
  })
})

describe('GrTreeSections: выбор', () => {
  it('выбранный узел один на все группы', async () => {
    const wrapper = setup({ currentKey: 'invoices', defaultExpandedKeys: ['rules'] })
    await nextTick()

    const selected = wrapper.findAll('[aria-selected="true"]')
    expect(selected).toHaveLength(1)
    expect(selected[0].text()).toContain('Счета')
  })

  it('клик по строке в одной группе сообщает ключ наружу', async () => {
    const wrapper = setup()
    await nextTick()

    await wrapper.findAll('[data-gr-tree-row]')[0].trigger('click')

    expect(wrapper.emitted('update:currentKey')?.at(-1)).toEqual(['esc'])
  })
})

describe('GrTreeSections: отметки', () => {
  it('ключи собираются объединением по группам', async () => {
    const wrapper = setup({ showCheckbox: true, checkedKeys: ['invoices'] })
    await nextTick()

    // Отметку переключает сам квадратик: клик по строке — это выбор узла, а не
    // изменение отметки, и подмешивать одно в другое нельзя.
    await wrapper.findAll('[data-gr-tree-checkbox]')[0].trigger('click')
    await nextTick()

    const emitted = wrapper.emitted('update:checkedKeys')?.at(-1)?.[0] as string[] | undefined

    // Отметка в одной группе не должна стирать отметки в другой: общего
    // родителя у групп нет, поэтому списки складываются без потерь.
    expect(emitted).toContain('invoices')
    expect(emitted).toContain('esc')
  })
})
