import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import GrSelect from '../GrSelect.vue'

/**
 * Виртуализация панели.
 *
 * jsdom не считает layout: высота контейнера и опций там нулевая, поэтому окно
 * считается от объявленного `dropdownMaxHeight` и оценок строк. Геометрию после
 * настоящего замера проверяет спек композабла (`useVirtualList.test.ts`), здесь —
 * контракт панели: что попадает в DOM, что говорит ARIA про наборы и группы и
 * куда указывает `aria-activedescendant`.
 */

const TOTAL = 1000
const GROUP_SIZE = 100

function flatOptions(count = TOTAL) {
  return Array.from({ length: count }, (_, index) => ({
    value: `opt-${index + 1}`,
    label: `Option ${index + 1}`,
  }))
}

/** Десять групп по сто опций: окно заведомо начинается серединой группы. */
function groupedOptions() {
  return Array.from({ length: TOTAL / GROUP_SIZE }, (_, groupIndex) => ({
    label: `Group ${groupIndex + 1}`,
    options: Array.from({ length: GROUP_SIZE }, (_, index) => ({
      value: `g${groupIndex + 1}-opt-${index + 1}`,
      label: `Group ${groupIndex + 1} option ${index + 1}`,
    })),
  }))
}

afterEach(() => {
  document.body.innerHTML = ''
})

function options(): HTMLButtonElement[] {
  return [...document.querySelectorAll<HTMLButtonElement>('[data-gr-select-option]')]
}

function listbox(): HTMLElement {
  return document.querySelector<HTMLElement>('[data-gr-select-listbox]')!
}

async function openVirtual(props: Record<string, unknown> = {}) {
  const wrapper = mount(GrSelect, {
    props: {
      modelValue: '',
      optionsView: 'panel',
      ariaLabel: 'Stack',
      options: flatOptions(),
      virtual: true,
      dropdownMaxHeight: 280,
      ...props,
    },
    attachTo: document.body,
  })

  await wrapper.get('[data-gr-select-trigger]').trigger('click')
  await nextTick()

  return wrapper
}

describe('GrSelect — виртуализация', () => {
  it('без пропа рисует все опции: включение осознанное', async () => {
    const wrapper = mount(GrSelect, {
      props: { modelValue: '', optionsView: 'panel', ariaLabel: 'Stack', options: flatOptions(200) },
      attachTo: document.body,
    })
    await wrapper.get('[data-gr-select-trigger]').trigger('click')

    expect(options()).toHaveLength(200)
    expect(listbox().getAttribute('data-gr-virtual')).toBeNull()
    wrapper.unmount()
  })

  it('с `virtual` держит в DOM окно, а не весь список', async () => {
    const wrapper = await openVirtual()

    const rendered = options().length
    expect(rendered).toBeGreaterThan(0)
    expect(rendered).toBeLessThan(50)
    wrapper.unmount()
  })

  it('прямые потомки listbox — только опции и группы', async () => {
    const wrapper = await openVirtual({ options: groupedOptions() })

    const roles = new Set([...listbox().children].map(child => child.getAttribute('role')))
    for (const role of roles) expect(['option', 'group']).toContain(role)
    wrapper.unmount()
  })

  it('размер набора у плоского списка считается от всех опций', async () => {
    const wrapper = await openVirtual()

    expect(options()[0].getAttribute('aria-setsize')).toBe(String(TOTAL))
    expect(options()[0].getAttribute('aria-posinset')).toBe('1')
    wrapper.unmount()
  })

  it('в обычном режиме набор не объявляется: его видно по DOM', async () => {
    const wrapper = mount(GrSelect, {
      props: { modelValue: '', optionsView: 'panel', ariaLabel: 'Stack', options: flatOptions(3) },
      attachTo: document.body,
    })
    await wrapper.get('[data-gr-select-trigger]').trigger('click')

    expect(options()[0].getAttribute('aria-setsize')).toBeNull()
    expect(options()[0].getAttribute('aria-posinset')).toBeNull()
    wrapper.unmount()
  })

  it('опция внутри группы считает набор по своей группе, а не по всему списку', async () => {
    const wrapper = await openVirtual({ options: groupedOptions() })

    const first = options()[0]
    // Сто опций в группе, а не тысяча в списке: по ARIA набор — это группа.
    expect(first.getAttribute('aria-setsize')).toBe(String(GROUP_SIZE))
    expect(first.getAttribute('aria-posinset')).toBe('1')
    wrapper.unmount()
  })

  it('группа, начатая выше окна, всё равно создаётся и берёт имя из `aria-label`', async () => {
    const wrapper = await openVirtual({ options: groupedOptions() })

    const box = listbox()
    box.scrollTop = 4000
    box.dispatchEvent(new Event('scroll'))
    await nextTick()

    const group = box.querySelector('[data-gr-select-group]')!
    // Заголовка в DOM нет — он остался выше окна, поэтому имя идёт напрямую.
    expect(group.querySelector('[data-gr-select-group-label]')).toBeNull()
    expect(group.getAttribute('aria-label')).toMatch(/^Group \d+$/)
    expect(group.getAttribute('aria-labelledby')).toBeNull()
    wrapper.unmount()
  })

  it('заголовок группы рендерится, когда его строка попала в окно', async () => {
    const wrapper = await openVirtual({ options: groupedOptions() })

    const label = listbox().querySelector('[data-gr-select-group-label]')
    expect(label?.textContent?.trim()).toBe('Group 1')
    expect(label?.getAttribute('role')).toBe('presentation')
    wrapper.unmount()
  })

  it('`End` оставляет `aria-activedescendant` на смонтированной опции', async () => {
    const wrapper = await openVirtual()
    const trigger = wrapper.get('[data-gr-select-trigger]')

    await trigger.trigger('keydown', { key: 'End' })
    await nextTick()
    await nextTick()

    const activeId = trigger.attributes('aria-activedescendant')
    expect(activeId).toBeTruthy()

    // Главное: ссылка не должна указывать в пустоту — вне окна элемента нет.
    const active = document.getElementById(activeId!)
    expect(active).not.toBeNull()
    expect(active!.getAttribute('aria-posinset')).toBe(String(TOTAL))
    wrapper.unmount()
  })

  it('прокрутка сдвигает окно', async () => {
    const wrapper = await openVirtual()
    const box = listbox()

    const before = options()[0].id
    box.scrollTop = 6000
    box.dispatchEvent(new Event('scroll'))
    await nextTick()

    const after = options()[0]
    expect(after.id).not.toBe(before)
    expect(Number(after.getAttribute('aria-posinset'))).toBeGreaterThan(100)
    wrapper.unmount()
  })

  it('предупреждает про нативный режим: виртуализировать там нечего', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const wrapper = mount(GrSelect, {
      props: { modelValue: '', optionsView: 'native', ariaLabel: 'Stack', options: flatOptions(5), virtual: true },
      attachTo: document.body,
    })

    expect(warn.mock.calls.flat().join(' ')).toContain('optionsView="panel"')
    warn.mockRestore()
    wrapper.unmount()
  })

  it('предупреждает про `view="link"`: ширина панели прыгала бы при прокрутке', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const wrapper = mount(GrSelect, {
      props: {
        modelValue: '',
        optionsView: 'panel',
        view: 'link',
        ariaLabel: 'Stack',
        options: flatOptions(5),
        virtual: true,
      },
      attachTo: document.body,
    })

    expect(warn.mock.calls.flat().join(' ')).toContain('view="link"')
    warn.mockRestore()
    wrapper.unmount()
  })
})
