import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import GrAutocomplete from '../GrAutocomplete.vue'

/**
 * Виртуализация панели.
 *
 * jsdom не считает layout: высота контейнера и опций там нулевая, поэтому окно
 * считается от объявленного `dropdownMaxHeight` и оценки строки. Геометрию после
 * настоящего замера проверяет спек композабла (`useVirtualList.test.ts`), здесь —
 * контракт панели: что попадает в DOM, что говорит ARIA и куда указывает
 * `aria-activedescendant`.
 */

const TOTAL = 2000

function manyOptions(count = TOTAL) {
  return Array.from({ length: count }, (_, index) => ({
    value: `opt-${index + 1}`,
    label: `Option ${index + 1}`,
  }))
}

afterEach(() => {
  document.body.innerHTML = ''
})

function optionEls(): HTMLButtonElement[] {
  return [...document.querySelectorAll<HTMLButtonElement>('[data-gr-autocomplete-option]')]
}

function listbox(): HTMLElement {
  return document.querySelector<HTMLElement>('[data-gr-autocomplete-listbox]')!
}

async function openVirtual(props: Record<string, unknown> = {}) {
  const wrapper = mount(GrAutocomplete, {
    props: {
      modelValue: '',
      options: manyOptions(),
      ariaLabel: 'Framework',
      virtual: true,
      dropdownMaxHeight: 280,
      ...props,
    },
    attachTo: document.body,
  })

  await wrapper.get('input').trigger('focus')
  await nextTick()

  return wrapper
}

describe('GrAutocomplete — виртуализация', () => {
  it('без пропа рисует все опции: включение осознанное', async () => {
    const wrapper = mount(GrAutocomplete, {
      props: { modelValue: '', options: manyOptions(300), ariaLabel: 'Framework' },
      attachTo: document.body,
    })
    await wrapper.get('input').trigger('focus')

    expect(optionEls()).toHaveLength(300)
    expect(listbox().getAttribute('data-gr-virtual')).toBeNull()
    wrapper.unmount()
  })

  it('с `virtual` держит в DOM окно, а не весь список', async () => {
    const wrapper = await openVirtual()

    const rendered = optionEls().length
    expect(rendered).toBeGreaterThan(0)
    expect(rendered).toBeLessThan(50)
    wrapper.unmount()
  })

  it('прямые потомки listbox — по-прежнему только опции', async () => {
    const wrapper = await openVirtual()

    // Распорки живут в псевдоэлементах именно поэтому: обёртка внутри listbox'а
    // отняла бы у роли обязательных потомков (`aria-required-children`).
    const roles = [...listbox().children].map(child => child.getAttribute('role'))
    expect(new Set(roles)).toEqual(new Set(['option']))
    wrapper.unmount()
  })

  it('размер набора и позиция объявлены от полного списка, а не от окна', async () => {
    const wrapper = await openVirtual()
    const first = optionEls()[0]

    // Иначе диктор сказал бы «1 из 20» на списке в две тысячи опций.
    expect(first.getAttribute('aria-setsize')).toBe(String(TOTAL))
    expect(first.getAttribute('aria-posinset')).toBe('1')
    wrapper.unmount()
  })

  it('в обычном режиме размер набора не объявляется: его видно по DOM', async () => {
    const wrapper = mount(GrAutocomplete, {
      props: { modelValue: '', options: manyOptions(3), ariaLabel: 'Framework' },
      attachTo: document.body,
    })
    await wrapper.get('input').trigger('focus')

    expect(optionEls()[0].getAttribute('aria-setsize')).toBeNull()
    expect(optionEls()[0].getAttribute('aria-posinset')).toBeNull()
    wrapper.unmount()
  })

  it('«Add …» входит в набор нулевым элементом и сдвигает позиции опций', async () => {
    // `filterable: false` — режим удалённого поиска: список не сужается вводом,
    // поэтому в наборе видно и строку «Add …», и все опции разом.
    const wrapper = await openVirtual({
      allowCustomValue: true,
      filterable: false,
      options: manyOptions(5),
    })

    await wrapper.get('input').setValue('brand new value')
    await nextTick()

    const add = document.querySelector('[data-gr-autocomplete-add-option]')!
    expect(add.getAttribute('aria-posinset')).toBe('1')
    // Пять опций плюс сама строка «Add …».
    expect(add.getAttribute('aria-setsize')).toBe('6')
    expect(optionEls()[0].getAttribute('aria-posinset')).toBe('2')
    wrapper.unmount()
  })

  it('`End` уводит активную опцию в конец списка и оставляет её смонтированной', async () => {
    const wrapper = await openVirtual()
    const input = wrapper.get('input')

    await input.trigger('keydown', { key: 'End' })
    await nextTick()
    await nextTick()

    const activeId = input.attributes('aria-activedescendant')
    expect(activeId).toBeTruthy()

    // Главное: id не должен указывать в пустоту — вне окна элемента нет вовсе.
    const active = document.getElementById(activeId!)
    expect(active).not.toBeNull()
    expect(active!.getAttribute('aria-posinset')).toBe(String(TOTAL))
    wrapper.unmount()
  })

  it('прокрутка сдвигает окно', async () => {
    const wrapper = await openVirtual()
    const box = listbox()

    const before = optionEls()[0].id
    box.scrollTop = 6000
    box.dispatchEvent(new Event('scroll'))
    await nextTick()

    const after = optionEls()[0]
    expect(after.id).not.toBe(before)
    expect(Number(after.getAttribute('aria-posinset'))).toBeGreaterThan(100)
    wrapper.unmount()
  })

  it('фильтрация пересобирает набор: размер объявляется от отфильтрованного', async () => {
    const wrapper = await openVirtual({ options: manyOptions(50) })

    await wrapper.get('input').setValue('Option 7')
    await nextTick()

    // «Option 7» плюс «Option 7x» — набор сузился, и ARIA обязана это отразить.
    const setsize = Number(optionEls()[0].getAttribute('aria-setsize'))
    expect(setsize).toBeLessThan(50)
    expect(setsize).toBe(optionEls().length)
    wrapper.unmount()
  })
})
