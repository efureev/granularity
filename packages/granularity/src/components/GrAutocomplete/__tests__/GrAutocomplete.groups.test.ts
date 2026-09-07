import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'

import GrAutocomplete from '../GrAutocomplete.vue'

const GROUPED = [
  { label: 'Фрукты', options: [{ value: 'apple', label: 'Яблоко' }, { value: 'pear', label: 'Груша' }] },
  { label: 'Овощи', options: [{ value: 'carrot', label: 'Морковь' }] },
  { value: 'other', label: 'Прочее' },
]

/** Панель телепортирована в `body` — искать её в обёртке бессмысленно. */
function getInput(wrapper: ReturnType<typeof mount>) {
  return wrapper.get('input[role="combobox"]')
}

async function openPanel(wrapper: ReturnType<typeof mount>) {
  await getInput(wrapper).trigger('focus')
  await nextTick()
}

function groups(): HTMLElement[] {
  return [...document.body.querySelectorAll<HTMLElement>('[data-gr-autocomplete-group]')]
}

function groupLabels(): string[] {
  return [...document.body.querySelectorAll('[data-gr-autocomplete-group-label]')]
    .map(node => node.textContent?.trim() ?? '')
}

function optionLabels(): string[] {
  return [...document.body.querySelectorAll('[data-gr-autocomplete-option]')]
    .map(node => node.textContent?.trim() ?? '')
}

describe('GrAutocomplete — группы опций', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('рисует заголовки групп и опции вне групп', async () => {
    const wrapper = mount(GrAutocomplete, { props: { modelValue: '', options: GROUPED } })
    await openPanel(wrapper)

    expect(groups()).toHaveLength(2)
    expect(groupLabels()).toEqual(['Фрукты', 'Овощи'])
    expect(optionLabels()).toEqual(['Яблоко', 'Груша', 'Морковь', 'Прочее'])
  })

  it('прямые потомки listbox — только опции и группы, но не заголовки', async () => {
    const wrapper = mount(GrAutocomplete, { props: { modelValue: '', options: GROUPED } })
    await openPanel(wrapper)

    const listbox = document.body.querySelector('[data-gr-autocomplete-listbox]')!
    for (const child of [...listbox.children]) {
      // Роль `listbox` объявляет чужих детей недопустимыми: заголовок обязан
      // лежать внутри своей группы, а не рядом с опциями.
      expect(child.getAttribute('role')).toMatch(/^(?:option|group)$/)
    }
  })

  it('группа названа своим заголовком через aria-labelledby', async () => {
    const wrapper = mount(GrAutocomplete, { props: { modelValue: '', options: GROUPED } })
    await openPanel(wrapper)

    const group = groups()[0]
    const labelledBy = group.getAttribute('aria-labelledby')

    expect(labelledBy).toBeTruthy()
    expect(document.getElementById(labelledBy!)?.textContent?.trim()).toBe('Фрукты')
  })

  it('фильтр прячет группу целиком, если в ней ничего не совпало', async () => {
    const wrapper = mount(GrAutocomplete, { props: { modelValue: '', options: GROUPED } })
    await openPanel(wrapper)

    await getInput(wrapper).setValue('морк')
    await nextTick()

    // Заголовок над пустотой читается как сбой, а не как «здесь ничего нет».
    expect(groupLabels()).toEqual(['Овощи'])
    expect(optionLabels()).toEqual(['Морковь'])
  })

  it('клавиатура ходит по опциям и не встаёт на заголовок', async () => {
    const wrapper = mount(GrAutocomplete, { props: { modelValue: '', options: GROUPED } })
    await openPanel(wrapper)

    const input = getInput(wrapper)
    const activeLabel = () => {
      const id = input.attributes('aria-activedescendant')
      return id ? document.getElementById(id)?.textContent?.trim() : undefined
    }

    // Открытие уже поставило активной первую опцию, поэтому ArrowDown ведёт ко второй.
    expect(activeLabel()).toBe('Яблоко')

    await input.trigger('keydown', { key: 'ArrowDown' })
    expect(activeLabel()).toBe('Груша')

    // Между «Груша» и «Морковь» стоит заголовок «Овощи» — навигация его минует.
    await input.trigger('keydown', { key: 'ArrowDown' })
    expect(activeLabel()).toBe('Морковь')
  })

  it('выбор опции из группы отдаёт её значение', async () => {
    const wrapper = mount(GrAutocomplete, { props: { modelValue: '', options: GROUPED } })
    await openPanel(wrapper)

    document.body.querySelectorAll<HTMLButtonElement>('[data-gr-autocomplete-option]')[2].click()
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['carrot'])
  })

  it('одинаковое значение в разных группах не схлопывается в один узел', async () => {
    const wrapper = mount(GrAutocomplete, {
      props: {
        modelValue: '',
        options: [
          { label: 'A', options: [{ value: 'x', label: 'Из A' }] },
          { label: 'B', options: [{ value: 'x', label: 'Из B' }] },
        ],
      },
    })
    await openPanel(wrapper)

    // Ключ строится с индексом группы: иначе Vue схлопнул бы обе опции в одну.
    expect(optionLabels()).toEqual(['Из A', 'Из B'])
  })

  it('метка выбранного значения находится внутри группы', () => {
    const wrapper = mount(GrAutocomplete, { props: { modelValue: 'carrot', options: GROUPED } })

    expect((getInput(wrapper).element as HTMLInputElement).value).toBe('Морковь')
  })

  it('плоский список опций работает как прежде', async () => {
    const wrapper = mount(GrAutocomplete, {
      props: { modelValue: '', options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }] },
    })
    await openPanel(wrapper)

    expect(groups()).toHaveLength(0)
    expect(optionLabels()).toEqual(['A', 'B'])
  })
})

describe('GrAutocomplete — группы и наведение мышью', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('наведение подсвечивает ту опцию, на которую навели, а не первую с таким значением', async () => {
    const wrapper = mount(GrAutocomplete, {
      props: {
        modelValue: '',
        options: [
          { label: 'A', options: [{ value: 'x', label: 'Из A' }] },
          { label: 'B', options: [{ value: 'x', label: 'Из B' }] },
        ],
      },
    })
    await openPanel(wrapper)

    const options = [...document.body.querySelectorAll<HTMLButtonElement>('[data-gr-autocomplete-option]')]
    options[1].dispatchEvent(new MouseEvent('mousemove', { bubbles: true }))
    await nextTick()

    const activeId = getInput(wrapper).attributes('aria-activedescendant')
    expect(document.getElementById(activeId!)?.textContent?.trim()).toBe('Из B')
  })
})
