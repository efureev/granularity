import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'

import { resetAnnouncer } from '../../../composables/useAnnouncer'
import { announced, move, press, release, stackRects } from '../../../testing'
import GrSortableList from '../GrSortableList.vue'

type Row = { id: string, title: string }

const rows: Row[] = [
  { id: 'a', title: 'Alpha' },
  { id: 'b', title: 'Bravo' },
  { id: 'c', title: 'Charlie' },
]

function mountList(props: Record<string, unknown> = {}) {
  return mount(GrSortableList, {
    props: {
      modelValue: rows,
      itemKey: 'id',
      ...props,
    },
    slots: {
      item: '<template #item="{ item }">{{ item.title }}</template>',
    },
    attachTo: document.body,
  })
}

function items(wrapper: ReturnType<typeof mountList>) {
  return wrapper.findAll('[data-gr-sortable-item]')
}

/** Строки по 20px подряд: в jsdom раскладки нет. */
function layout(wrapper: ReturnType<typeof mountList>): void {
  stackRects(items(wrapper).map(row => row.element), { size: 20 })
}

afterEach(() => {
  resetAnnouncer()
})

describe('разметка и ARIA', () => {
  it('строки — пункты списка с позицией и размером набора', () => {
    const wrapper = mountList()
    const rendered = items(wrapper)

    expect(rendered).toHaveLength(3)
    expect(wrapper.get('[data-gr-sortable]').attributes('role')).toBe('list')
    expect(rendered[0].attributes('role')).toBe('listitem')
    expect(rendered[1].attributes('aria-posinset')).toBe('2')
    expect(rendered[1].attributes('aria-setsize')).toBe('3')

    wrapper.unmount()
  })

  it('на весь список одна остановка `Tab`', () => {
    const wrapper = mountList()
    const tabindexes = items(wrapper).map(row => row.attributes('tabindex'))

    expect(tabindexes.filter(value => value === '0')).toHaveLength(1)
    expect(tabindexes.filter(value => value === '-1')).toHaveLength(2)

    wrapper.unmount()
  })

  it('ручка не табируема: таб-порядок принадлежит строке', () => {
    const wrapper = mountList()

    expect(wrapper.get('[data-gr-sortable-handle]').attributes('tabindex')).toBe('-1')

    wrapper.unmount()
  })

  it('пустой набор показывает состояние из локали', () => {
    const wrapper = mountList({ modelValue: [] })

    expect(wrapper.find('[data-gr-sortable-empty]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Nothing to sort yet')

    wrapper.unmount()
  })
})

describe('перенос указателем', () => {
  it('переставляет и отдаёт новый массив, не трогая вход', async () => {
    const source = [...rows]
    const wrapper = mountList({ modelValue: source })
    layout(wrapper)

    press(items(wrapper)[0].get('[data-gr-sortable-handle]').element, { clientY: 10 })
    move({ clientY: 55 })
    release()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('move')?.[0]).toEqual([0, 2])
    expect(wrapper.emitted('update:modelValue')?.[0][0]).toEqual([rows[1], rows[2], rows[0]])
    expect(wrapper.emitted('change')).toHaveLength(1)
    expect(source).toEqual(rows)

    wrapper.unmount()
  })

  it('клик по ручке без движения ничего не переставляет', async () => {
    const wrapper = mountList()
    layout(wrapper)

    press(items(wrapper)[0].get('[data-gr-sortable-handle]').element, { clientY: 10 })
    release()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('move')).toBeUndefined()

    wrapper.unmount()
  })

  it('`disabled` не даёт начать перенос', async () => {
    const wrapper = mountList({ disabled: true })
    layout(wrapper)

    press(items(wrapper)[0].get('[data-gr-sortable-handle]').element, { clientY: 10 })
    move({ clientY: 55 })
    release()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('move')).toBeUndefined()

    wrapper.unmount()
  })

  it('при `handleOnly: false` тянется вся строка', async () => {
    const wrapper = mountList({ handleOnly: false })
    layout(wrapper)

    press(items(wrapper)[0].element, { clientY: 10 })
    move({ clientY: 55 })
    release()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('move')?.[0]).toEqual([0, 2])

    wrapper.unmount()
  })
})

describe('клавиатура', () => {
  it('взять, подвинуть, положить', async () => {
    const wrapper = mountList()
    const first = items(wrapper)[0]

    await first.trigger('keydown', { key: ' ' })
    expect(items(wrapper)[0].attributes('aria-grabbed')).toBe('true')

    await first.trigger('keydown', { key: 'ArrowDown' })
    await first.trigger('keydown', { key: 'ArrowDown' })
    await first.trigger('keydown', { key: ' ' })

    expect(wrapper.emitted('move')?.[0]).toEqual([0, 2])
    expect(items(wrapper)[0].attributes('aria-grabbed')).toBeUndefined()

    wrapper.unmount()
  })

  it('`Esc` отменяет и ничего не переставляет', async () => {
    const wrapper = mountList()
    const first = items(wrapper)[0]

    await first.trigger('keydown', { key: ' ' })
    await first.trigger('keydown', { key: 'ArrowDown' })
    await first.trigger('keydown', { key: 'Escape' })

    expect(wrapper.emitted('move')).toBeUndefined()
    expect(items(wrapper)[0].attributes('aria-grabbed')).toBeUndefined()

    wrapper.unmount()
  })

  it('не взятая строка отдаёт стрелки навигации, а не переносу', async () => {
    const wrapper = mountList()

    await items(wrapper)[0].trigger('keydown', { key: 'ArrowDown' })

    expect(wrapper.emitted('move')).toBeUndefined()
    expect(items(wrapper)[1].attributes('tabindex')).toBe('0')

    wrapper.unmount()
  })

  it('за краями набора элемент не уезжает', async () => {
    const wrapper = mountList()
    const first = items(wrapper)[0]

    await first.trigger('keydown', { key: ' ' })
    await first.trigger('keydown', { key: 'ArrowUp' })
    await first.trigger('keydown', { key: ' ' })

    expect(wrapper.emitted('move')).toBeUndefined()

    wrapper.unmount()
  })

  it('уход фокуса из списка снимает захват', async () => {
    const wrapper = mountList()
    const first = items(wrapper)[0]

    await first.trigger('keydown', { key: ' ' })
    await wrapper.get('[data-gr-sortable]').trigger('focusout', { relatedTarget: document.body })

    expect(items(wrapper)[0].attributes('aria-grabbed')).toBeUndefined()

    wrapper.unmount()
  })

  it('`disabled` не даёт взять строку', async () => {
    const wrapper = mountList({ disabled: true })

    await items(wrapper)[0].trigger('keydown', { key: ' ' })

    expect(items(wrapper)[0].attributes('aria-grabbed')).toBeUndefined()

    wrapper.unmount()
  })

  it('горизонтальный список слушает стрелки своей оси', async () => {
    const wrapper = mountList({ orientation: 'horizontal' })
    const first = items(wrapper)[0]

    await first.trigger('keydown', { key: ' ' })
    await first.trigger('keydown', { key: 'ArrowRight' })
    await first.trigger('keydown', { key: ' ' })

    expect(wrapper.emitted('move')?.[0]).toEqual([0, 1])

    wrapper.unmount()
  })
})

describe('объявления', () => {
  it('захват, движение и отпускание объявляются в живой регион', async () => {
    const wrapper = mountList()
    const first = items(wrapper)[0]

    await first.trigger('keydown', { key: ' ' })
    expect(await announced()).toBe('Grabbed. Position 1 of 3')

    await first.trigger('keydown', { key: 'ArrowDown' })
    expect(await announced()).toBe('Position 2 of 3')

    await first.trigger('keydown', { key: ' ' })
    expect(await announced()).toBe('Dropped at position 2 of 3')

    wrapper.unmount()
  })

  it('отмена объявляется отдельно', async () => {
    const wrapper = mountList()
    const first = items(wrapper)[0]

    await first.trigger('keydown', { key: ' ' })
    await first.trigger('keydown', { key: 'Escape' })

    expect(await announced()).toBe('Move cancelled')

    wrapper.unmount()
  })
})

describe('императивный API', () => {
  it('`move` переставляет так же, как перенос', async () => {
    const wrapper = mountList()

    ;(wrapper.vm as unknown as { move: (from: number, to: number) => void }).move(2, 0)

    expect(wrapper.emitted('move')?.[0]).toEqual([2, 0])
    expect(wrapper.emitted('update:modelValue')?.[0][0]).toEqual([rows[2], rows[0], rows[1]])

    wrapper.unmount()
  })
})
