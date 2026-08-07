import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import GrCommandPalette from '../GrCommandPalette.vue'
import type { GrCommandItem } from '../filtering'

/**
 * Виртуализация списка команд.
 *
 * jsdom не считает layout: высота контейнера и строк там нулевая, поэтому окно
 * считается от объявленного `maxHeight` и оценок строк. Геометрию после
 * настоящего замера проверяет спек композабла (`useVirtualList.test.ts`), здесь —
 * контракт списка: что попадает в DOM, что говорит ARIA про наборы и группы и
 * куда указывает `aria-activedescendant`.
 */

const GROUPS = 20
const PER_GROUP = 50
const TOTAL = GROUPS * PER_GROUP

function manyCommands(): GrCommandItem[] {
  return Array.from({ length: GROUPS }, (_, groupIndex) =>
    Array.from({ length: PER_GROUP }, (_, index) => ({
      id: `g${groupIndex + 1}-cmd-${index + 1}`,
      label: `Group ${groupIndex + 1} command ${index + 1}`,
      group: `Group ${groupIndex + 1}`,
    }))).flat()
}

async function mountPalette(props: Record<string, unknown> = {}) {
  const wrapper = mount(GrCommandPalette, {
    props: { modelValue: true, items: manyCommands(), ...props },
    global: { stubs: { teleport: true } },
  })

  await nextTick()
  return wrapper
}

function items(wrapper: Awaited<ReturnType<typeof mountPalette>>) {
  return wrapper.findAll('[data-gr-command-palette-item]')
}

function list(wrapper: Awaited<ReturnType<typeof mountPalette>>) {
  return wrapper.get('[data-testid="gr-command-palette-list"]')
}

describe('GrCommandPalette — виртуализация', () => {
  it('без пропа рендерит все команды: включение осознанное', async () => {
    const wrapper = await mountPalette()

    expect(items(wrapper)).toHaveLength(TOTAL)
    expect(list(wrapper).attributes('data-gr-virtual')).toBeUndefined()
  })

  it('с `virtual` держит в DOM окно, а не весь список', async () => {
    const wrapper = await mountPalette({ virtual: true, maxHeight: 360 })

    const rendered = items(wrapper).length
    expect(rendered).toBeGreaterThan(0)
    expect(rendered).toBeLessThan(50)
  })

  it('прямые потомки listbox — по-прежнему только группы', async () => {
    const wrapper = await mountPalette({ virtual: true })

    const roles = [...list(wrapper).element.children].map(child => child.getAttribute('role'))
    expect(roles.length).toBeGreaterThan(0)
    expect(new Set(roles)).toEqual(new Set(['group']))
  })

  it('размер набора у команды равен размеру её группы, а не всего списка', async () => {
    const wrapper = await mountPalette({ virtual: true })
    const first = items(wrapper)[0]

    // Пятьдесят команд в группе, а не тысяча в палитре: по ARIA набор — группа.
    expect(first.attributes('aria-setsize')).toBe(String(PER_GROUP))
    expect(first.attributes('aria-posinset')).toBe('1')
  })

  it('в обычном режиме набор не объявляется: его видно по DOM', async () => {
    const wrapper = await mountPalette()

    expect(items(wrapper)[0].attributes('aria-setsize')).toBeUndefined()
    expect(items(wrapper)[0].attributes('aria-posinset')).toBeUndefined()
  })

  it('заголовок группы рендерится, когда его строка попала в окно', async () => {
    const wrapper = await mountPalette({ virtual: true })

    const group = wrapper.get('[role="group"]')
    const label = group.get('[data-gr-command-palette-group]')

    expect(label.attributes('role')).toBe('presentation')
    expect(group.attributes('aria-labelledby')).toBe(label.attributes('id'))
    expect(group.attributes('aria-label')).toBeUndefined()
  })

  it('группа, начатая выше окна, создаётся и берёт имя из `aria-label`', async () => {
    const wrapper = await mountPalette({ virtual: true })

    const box = list(wrapper).element as HTMLElement
    box.scrollTop = 4000
    box.dispatchEvent(new Event('scroll'))
    await nextTick()

    const group = wrapper.get('[role="group"]')
    // Заголовка в DOM нет — он остался выше окна, поэтому имя идёт напрямую.
    expect(group.find('[data-gr-command-palette-group]').exists()).toBe(false)
    expect(group.attributes('aria-label')).toMatch(/^Group \d+$/)
    expect(group.attributes('aria-labelledby')).toBeUndefined()
  })

  it('прокрутка сдвигает окно', async () => {
    const wrapper = await mountPalette({ virtual: true })
    const box = list(wrapper).element as HTMLElement

    const before = items(wrapper)[0].attributes('id')
    box.scrollTop = 6000
    box.dispatchEvent(new Event('scroll'))
    await nextTick()

    expect(items(wrapper)[0].attributes('id')).not.toBe(before)
  })

  it('стрелка вниз доводит `aria-activedescendant` до смонтированной команды', async () => {
    const wrapper = await mountPalette({ virtual: true })
    const input = wrapper.get('[data-testid="gr-command-palette-input"]')

    // Уходим заведомо за пределы стартового окна.
    for (let step = 0; step < 40; step++) {
      await input.trigger('keydown', { key: 'ArrowDown' })
    }
    await nextTick()
    await nextTick()

    const activeId = wrapper.get('[data-testid="gr-command-palette-input"]').attributes('aria-activedescendant')
    expect(activeId).toBeTruthy()

    // Главное: ссылка не должна указывать в пустоту — вне окна элемента нет.
    expect(wrapper.find(`#${activeId}`).exists()).toBe(true)
  })

  it('фильтрация сужает набор, и ARIA сужается вместе с ним', async () => {
    const wrapper = await mountPalette({ virtual: true })

    await wrapper.get('[data-testid="gr-command-palette-input"]').setValue('Group 7 command 1')
    await nextTick()

    const setsize = Number(items(wrapper)[0].attributes('aria-setsize'))
    expect(setsize).toBeLessThan(PER_GROUP)
    expect(setsize).toBe(items(wrapper).length)
  })
})
