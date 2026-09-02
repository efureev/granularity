import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick, ref } from 'vue'

import { resetGranularityDom } from '../../../testing'
import GrTransfer from '../GrTransfer.vue'

afterEach(resetGranularityDom)

interface Row extends Record<string, unknown> { id: string, label: string, disabled?: boolean }

const catalog: Row[] = [
  { id: 'a', label: 'Чтение' },
  { id: 'b', label: 'Запись' },
  { id: 'c', label: 'Удаление' },
  { id: 'd', label: 'Аудит' },
]

function mountTransfer(props: Record<string, unknown> = {}) {
  return mount(GrTransfer, {
    attachTo: document.body,
    props: { items: catalog, modelValue: [], ariaLabel: 'Права', ...props },
  })
}

function listOf(wrapper: ReturnType<typeof mountTransfer>, side: 'source' | 'target') {
  return wrapper.get(`[data-gr-transfer-list="${side}"]`)
}

function optionsOf(wrapper: ReturnType<typeof mountTransfer>, side: 'source' | 'target') {
  return listOf(wrapper, side).findAll('[data-gr-transfer-option]')
}

describe('GrTransfer: роли и имена', () => {
  it('корень — группа с именем', () => {
    const wrapper = mountTransfer()
    const root = wrapper.get('[data-gr-transfer]')

    expect(root.attributes('role')).toBe('group')
    expect(root.attributes('aria-label')).toBe('Права')
  })

  it('обе панели — listbox с мультивыбором и своим именем', () => {
    const wrapper = mountTransfer()

    for (const side of ['source', 'target'] as const) {
      const list = listOf(wrapper, side)
      expect(list.attributes('role')).toBe('listbox')
      expect(list.attributes('aria-multiselectable')).toBe('true')
      expect(list.attributes('aria-labelledby')).toBeTruthy()
    }
  })

  it('строка — option с aria-selected на каждой, а не только на выбранных', () => {
    const wrapper = mountTransfer({ modelValue: ['a'] })
    const rows = optionsOf(wrapper, 'source')

    expect(rows.every(row => row.attributes('role') === 'option')).toBe(true)
    expect(rows.every(row => row.attributes('aria-selected') !== undefined)).toBe(true)
  })

  it('панель держит ровно одну остановку Tab', () => {
    const wrapper = mountTransfer()
    const tabindexes = optionsOf(wrapper, 'source').map(row => row.attributes('tabindex'))

    expect(tabindexes.filter(value => value === '0')).toHaveLength(1)
  })

  it('сам список таб-стопа не получает: его строки фокусируемы', () => {
    const wrapper = mountTransfer()

    expect(listOf(wrapper, 'source').attributes('tabindex')).toBeUndefined()
  })

  it('пустая правая панель всё равно рисует список — на нём висят состояния поля', () => {
    const wrapper = mountTransfer({ modelValue: [], required: true, invalid: true })
    const list = listOf(wrapper, 'target')

    expect(list.attributes('aria-required')).toBe('true')
    expect(list.attributes('aria-invalid')).toBe('true')
    expect(list.findAll('[data-gr-transfer-option]')).toHaveLength(0)
  })

  it('состояния поля висят на правой панели, а не на левой', () => {
    const wrapper = mountTransfer({ required: true, invalid: true, readonly: true })

    expect(listOf(wrapper, 'source').attributes('aria-required')).toBeUndefined()
    expect(listOf(wrapper, 'target').attributes('aria-readonly')).toBe('true')
  })

  it('отметка строки декоративна — вложенного интерактива в option нет', () => {
    const wrapper = mountTransfer({ modelValue: ['a'] })
    const row = optionsOf(wrapper, 'target')[0]

    expect(row.find('[aria-hidden="true"]').exists()).toBe(true)
    expect(row.findAll('input, button, [role="checkbox"], [tabindex="0"]')).toHaveLength(0)
  })
})

describe('GrTransfer: модель', () => {
  it('раскладывает каталог по панелям', () => {
    const wrapper = mountTransfer({ modelValue: ['c'] })

    expect(optionsOf(wrapper, 'source').map(row => row.text())).toEqual(['Чтение', 'Запись', 'Аудит'])
    expect(optionsOf(wrapper, 'target').map(row => row.text())).toEqual(['Удаление'])
  })

  it('правая панель идёт в порядке модели, а не каталога', () => {
    const wrapper = mountTransfer({ modelValue: ['d', 'a'] })

    expect(optionsOf(wrapper, 'target').map(row => row.text())).toEqual(['Аудит', 'Чтение'])
  })

  it('двойной клик переносит строку и отдаёт новый массив', async () => {
    const wrapper = mountTransfer()
    await optionsOf(wrapper, 'source')[1].trigger('dblclick')
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['b']])
    expect(wrapper.emitted('change')?.at(-1)).toEqual([['b']])
  })

  it('вход не мутируется: наружу уезжает новый массив', async () => {
    const model: string[] = []
    const wrapper = mountTransfer({ modelValue: model })
    await optionsOf(wrapper, 'source')[0].trigger('dblclick')
    await nextTick()

    const emitted = wrapper.emitted('update:modelValue')?.at(-1)?.[0]
    expect(emitted).not.toBe(model)
    expect(model).toEqual([])
  })

  it('кнопка переносит всё отмеченное', async () => {
    const wrapper = mountTransfer()
    await optionsOf(wrapper, 'source')[0].trigger('click')
    await optionsOf(wrapper, 'source')[2].trigger('click', { ctrlKey: true })
    await wrapper.get('[data-gr-transfer-to-target]').trigger('click')
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['a', 'c']])
    expect(wrapper.emitted('transfer')?.at(-1)).toEqual([['a', 'c'], 'toTarget'])
  })

  it('возврат налево убирает ключи из модели', async () => {
    const wrapper = mountTransfer({ modelValue: ['a', 'b'] })
    await optionsOf(wrapper, 'target')[0].trigger('click')
    await wrapper.get('[data-gr-transfer-to-source]').trigger('click')
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['b']])
  })

  it('ключ, которого нет в каталоге, сохраняется при переносе', async () => {
    const wrapper = mountTransfer({ modelValue: ['ghost'] })
    await optionsOf(wrapper, 'source')[0].trigger('dblclick')
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['ghost', 'a']])
  })

  it('дубли в модели схлопываются на показе, но эха не эмитят', () => {
    const wrapper = mountTransfer({ modelValue: ['a', 'a'] })

    expect(optionsOf(wrapper, 'target')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})

describe('GrTransfer: состояния', () => {
  it('выключенная строка не переносится', async () => {
    const items: Row[] = [...catalog, { id: 'e', label: 'Системное', disabled: true }]
    const wrapper = mountTransfer({ items })
    const rows = optionsOf(wrapper, 'source')
    const locked = rows[rows.length - 1]

    expect(locked.attributes('aria-disabled')).toBe('true')

    await locked.trigger('dblclick')
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('выключенная строка остаётся в обходе — иначе AT не прочтёт, что она есть', () => {
    const items: Row[] = [{ id: 'e', label: 'Системное', disabled: true }, ...catalog]
    const wrapper = mountTransfer({ items })

    expect(optionsOf(wrapper, 'source')[0].attributes('tabindex')).toBeDefined()
  })

  it('disabled запрещает и выбор, и перенос', async () => {
    const wrapper = mountTransfer({ disabled: true })
    await optionsOf(wrapper, 'source')[0].trigger('click')
    await wrapper.get('[data-gr-transfer-to-target]').trigger('click')
    await nextTick()

    expect(wrapper.get('[data-gr-transfer]').attributes('aria-disabled')).toBe('true')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('readonly оставляет выбор, но запрещает перенос', async () => {
    const wrapper = mountTransfer({ readonly: true })
    await optionsOf(wrapper, 'source')[0].trigger('click')
    await nextTick()

    expect(optionsOf(wrapper, 'source')[0].attributes('aria-selected')).toBe('true')

    await wrapper.get('[data-gr-transfer-to-target]').trigger('click')
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('readonly не выключает контрол нативно', () => {
    const wrapper = mountTransfer({ readonly: true })

    expect(wrapper.html()).not.toContain('disabled=""')
  })

  it('кнопка без пути наружу помечена aria-disabled и остаётся в таб-порядке', () => {
    const wrapper = mountTransfer()
    const button = wrapper.get('[data-gr-transfer-to-target]')

    expect(button.attributes('aria-disabled')).toBe('true')
    expect(button.attributes('disabled')).toBeUndefined()
  })
})

describe('GrTransfer: поиск', () => {
  it('сужает только свою панель', async () => {
    const wrapper = mountTransfer({ modelValue: ['d'] })
    await wrapper.findAll('input[type="search"]')[0].setValue('за')
    await nextTick()

    expect(optionsOf(wrapper, 'source').map(row => row.text())).toEqual(['Запись'])
    expect(optionsOf(wrapper, 'target')).toHaveLength(1)
  })

  it('счётчик считает по всей панели, а не по видимой части', async () => {
    const wrapper = mountTransfer()
    await optionsOf(wrapper, 'source')[0].trigger('click')
    await wrapper.findAll('input[type="search"]')[0].setValue('запись')
    await nextTick()

    // «Чтение» скрыто фильтром, но остаётся отмеченным и посчитанным.
    expect(wrapper.get('[data-gr-transfer-panel="source"]').text()).toContain('1 of 4')
  })

  it('скрытая фильтром отметка всё равно переносится', async () => {
    const wrapper = mountTransfer()
    await optionsOf(wrapper, 'source')[0].trigger('click')
    await wrapper.findAll('input[type="search"]')[0].setValue('удал')
    await wrapper.get('[data-gr-transfer-to-target]').trigger('click')
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['a']])
  })

  it('пустой результат показывает свой текст, а не пустую панель', async () => {
    const wrapper = mountTransfer()
    await wrapper.findAll('input[type="search"]')[0].setValue('ничего')
    await nextTick()

    expect(wrapper.get('[data-gr-transfer-panel="source"]').text()).toContain('Nothing matches the search')
  })

  it('свой матчер получает сырой запрос', async () => {
    const seen: string[] = []
    const wrapper = mountTransfer({
      filter: (item: Row, query: string) => {
        seen.push(query)
        return item.id === 'c'
      },
    })
    await wrapper.findAll('input[type="search"]')[0].setValue('  ЧтО-ТО  ')
    await nextTick()

    expect(seen).toContain('  ЧтО-ТО  ')
    expect(optionsOf(wrapper, 'source').map(row => row.text())).toEqual(['Удаление'])
  })

  it('searchable=false убирает поля поиска', () => {
    const wrapper = mountTransfer({ searchable: false })

    expect(wrapper.findAll('input[type="search"]')).toHaveLength(0)
  })
})

describe('GrTransfer: обратная связь и перестановка кнопками', () => {
  it('приехавшие строки коротко подсвечиваются', async () => {
    // Модель обязана быть живой: без неё правая панель не пополняется вовсе,
    // и проверять было бы нечего.
    const model = ref<string[]>([])
    const wrapper = mount({
      components: { GrTransfer },
      setup: () => ({ model, catalog }),
      template: `<GrTransfer v-model="model" :items="catalog" aria-label="Права" />`,
    }, { attachTo: document.body })
    await nextTick()

    await wrapper.findAll('[data-gr-transfer-option]')[0].trigger('dblclick')
    await nextTick()
    await nextTick()

    const target = wrapper.get('[data-gr-transfer-list="target"]').findAll('[data-gr-transfer-option]')
    expect(target).toHaveLength(1)
    expect(target[0].classes()).toContain('gr-transfer-arrived')
  })

  it('подсветка не остаётся на строках, которые никуда не ехали', async () => {
    const model = ref<string[]>(['b'])
    const wrapper = mount({
      components: { GrTransfer },
      setup: () => ({ model, catalog }),
      template: `<GrTransfer v-model="model" :items="catalog" aria-label="Права" />`,
    }, { attachTo: document.body })
    await nextTick()

    await wrapper.get('[data-gr-transfer-list="source"]')
      .findAll('[data-gr-transfer-option]')[0]
      .trigger('dblclick')
    await nextTick()
    await nextTick()

    const marked = wrapper.get('[data-gr-transfer-list="target"]')
      .findAll('[data-gr-transfer-option]')
      .filter(row => row.classes().includes('gr-transfer-arrived'))
    expect(marked).toHaveLength(1)
  })

  it('кнопки перестановки видны у правой панели и двигают выделение', async () => {
    const wrapper = mountTransfer({ modelValue: ['a', 'b', 'c'] })
    await optionsOf(wrapper, 'target')[0].trigger('click')
    await wrapper.get('[data-gr-transfer-move-down]').trigger('click')
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['b', 'a', 'c']])
  })

  it('перестановка кнопкой вверх', async () => {
    const wrapper = mountTransfer({ modelValue: ['a', 'b', 'c'] })
    await optionsOf(wrapper, 'target')[2].trigger('click')
    await wrapper.get('[data-gr-transfer-move-up]').trigger('click')
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['a', 'c', 'b']])
  })

  it('без sortable кнопок перестановки нет', () => {
    const wrapper = mountTransfer({ modelValue: ['a', 'b'], sortable: false })

    expect(wrapper.find('[data-gr-transfer-move-up]').exists()).toBe(false)
  })

  it('на одном кадре справа кнопок перестановки нет', () => {
    const wrapper = mountTransfer({ modelValue: ['a'] })

    expect(wrapper.find('[data-gr-transfer-move-up]').exists()).toBe(false)
  })

  it('кнопка без выбора погашена, но остаётся в таб-порядке', () => {
    const wrapper = mountTransfer({ modelValue: ['a', 'b'] })
    const up = wrapper.get('[data-gr-transfer-move-up]')

    expect(up.attributes('disabled')).toBeUndefined()
    expect(up.attributes('aria-label')).toBe('Move earlier')
  })
})

describe('GrTransfer: своя шапка не уносит доступное имя', () => {
  it('со своим #header панель именуется через aria-label', () => {
    const wrapper = mount(GrTransfer, {
      attachTo: document.body,
      props: { items: catalog, modelValue: [], ariaLabel: 'Права' },
      slots: { header: '<div>своя шапка</div>' },
    })

    for (const side of ['source', 'target'] as const) {
      const list = wrapper.get(`[data-gr-transfer-list="${side}"]`)
      expect(list.attributes('aria-label')).toBeTruthy()
      expect(list.attributes('aria-labelledby')).toBeUndefined()
    }
  })

  it('со штатной шапкой имя приходит ссылкой на заголовок', () => {
    const wrapper = mountTransfer()
    const list = wrapper.get('[data-gr-transfer-list="source"]')
    const id = list.attributes('aria-labelledby')

    expect(id).toBeTruthy()
    expect(wrapper.get(`#${id}`).text()).toBe('Available')
  })
})
