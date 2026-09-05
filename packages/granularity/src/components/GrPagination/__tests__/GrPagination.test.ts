import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import GrPagination, { type GrPaginationProps } from '../GrPagination.vue'
import { navButtonSizes, pageBoxSizes } from '../grPaginationStyles'
import type { GranularityI18nAdapter } from '../../../i18n/adapter'
import { granularityGlobal } from '../../../testing'

type PaginationMountOptions = {
  locale?: 'en' | 'ru'
  props?: Partial<GrPaginationProps>
  slots?: Record<string, string>
}

function createGranularityTestI18n(locale: 'en' | 'ru'): GranularityI18nAdapter {
  const messages = {
    en: {
      'gr.pagination.pageSize': 'Page size',
      'gr.pagination.prev': 'Prev',
      'gr.pagination.next': 'Next',
    },
    ru: {
      'gr.pagination.pageSize': 'Размер страницы',
      'gr.pagination.prev': 'Назад',
      'gr.pagination.next': 'Вперёд',
    },
  } as const

  return {
    t(key) {
      return messages[locale][key as keyof typeof messages.en] ?? key
    },
  }
}

function mountPagination(options: PaginationMountOptions = {}) {
  const i18n = options.locale
    ? createGranularityTestI18n(options.locale)
    : undefined

  return mount(GrPagination, {
    props: {
      page: 3,
      pageSize: 20,
      total: 160,
      pageSizes: [10, 20, 50],
      ...(options.props ?? {}),
    },
    slots: options.slots,
    global: i18n ? granularityGlobal({ i18n }) : undefined,
  })
}

describe('GrPagination', () => {
  it('усекает номера многоточием: первая/последняя + соседи вокруг текущей', () => {
    const wrapper = mountPagination({
      props: {
        page: 6,
        pageSize: 10,
        total: 120, // 12 страниц
      },
    })

    const numericButtons = wrapper.findAll('[data-gr-pagination-page]')
    // boundary=1, sibling=1: [1] … [5 6 7] … [12]
    expect(numericButtons.map(button => button.text())).toEqual(['1', '5', '6', '7', '12'])
    // активная страница подсвечена
    const active = numericButtons.find(button => button.text() === '6')!
    expect(active.classes()).toContain('bg-[var(--gr-primary)]')
    // есть многоточия (с обеих сторон)
    expect(wrapper.findAll('[data-gr-pagination-ellipsis]').length).toBe(2)
  })

  it('без разрывов многоточие не рисуется', () => {
    const wrapper = mountPagination({
      props: { page: 1, pageSize: 20, total: 60 }, // 3 страницы
    })

    expect(wrapper.findAll('[data-gr-pagination-page]').map(b => b.text())).toEqual(['1', '2', '3'])
    expect(wrapper.findAll('[data-gr-pagination-ellipsis]').length).toBe(0)
  })

  it('эмитит изменение страницы по номеру и по prev/next/first/last', async () => {
    const wrapper = mountPagination() // page 3, 8 страниц

    await wrapper.findAll('[data-gr-pagination-page]').find(b => b.text() === '4')!.trigger('click')
    await wrapper.get('[data-gr-pagination-prev]').trigger('click')
    await wrapper.get('[data-gr-pagination-next]').trigger('click')
    await wrapper.get('[data-gr-pagination-first]').trigger('click')
    await wrapper.get('[data-gr-pagination-last]').trigger('click')

    expect(wrapper.emitted('update:page')).toEqual([[4], [2], [4], [1], [8]])
  })

  it('клампит страницу к последней, когда total уменьшился (page вышла за диапазон)', async () => {
    const wrapper = mountPagination({
      props: { page: 8, pageSize: 20, total: 160 }, // 8 страниц, page=8 — валидно
    })

    expect(wrapper.emitted('update:page')).toBeFalsy()

    // total упал до 60 → 3 страницы, page=8 больше → должен эмитнуться кламп к 3
    await wrapper.setProps({ total: 60 })
    expect(wrapper.emitted('update:page')).toEqual([[3]])
  })

  it('эмитит изменение размера страницы через GrSelect', async () => {
    const wrapper = mountPagination({
      props: {
        page: 2,
        showPageSize: true,
      },
    })
    const select = wrapper.findComponent({ name: 'GrSelect' })

    expect(select.exists()).toBe(true)

    await select.vm.$emit('update:modelValue', '50')

    expect(wrapper.emitted('update:pageSize')).toEqual([[50]])
  })

  it('использует переводы из granular i18n адаптера', () => {
    const wrapper = mountPagination({ locale: 'ru', props: { showPageSize: true } })

    expect(wrapper.text()).toContain('Назад')
    expect(wrapper.text()).toContain('Вперёд')
    expect(wrapper.findComponent({ name: 'GrSelect' }).props('ariaLabel')).toBe('Размер страницы')
  })

  it('aria-label региона навигации не путается с лейблом page-size селекта', () => {
    const wrapper = mountPagination({ props: { showPageSize: true } })

    // Регрессия: раньше aria-label всего `role="navigation"` ошибочно брался из ключа
    // `gr.pagination.pageSize` (лейбл `GrSelect` для размера страницы), а не из
    // собственного `gr.pagination.label`.
    const nav = wrapper.get('[role="navigation"]')
    expect(nav.attributes('aria-label')).toBe('Pagination')
    expect(wrapper.findComponent({ name: 'GrSelect' }).props('ariaLabel')).toBe('Page size')
  })

  it('локализует aria-label номера страницы через t() с интерполяцией {n}', () => {
    const wrapper = mountPagination({
      props: { page: 6, pageSize: 10, total: 120 },
    })

    const pageButtons = wrapper.findAll('[data-gr-pagination-page]')
    const labels = pageButtons.map(button => button.attributes('aria-label'))

    // page 6 из 12: [1] … [5 6 7] … [12]
    expect(labels).toEqual(['Page 1', 'Page 5', 'Page 6', 'Page 7', 'Page 12'])
  })
})
describe('GrPagination — конфигурация', () => {
  it('селект размера страницы рендерится только по запросу', async () => {
    const wrapper = mountPagination()

    expect(wrapper.findComponent({ name: 'GrSelect' }).exists()).toBe(false)

    await wrapper.setProps({ showPageSize: true })
    expect(wrapper.findComponent({ name: 'GrSelect' }).exists()).toBe(true)
  })

  it('showTotal показывает диапазон, слот #total заменяет его целиком', () => {
    const wrapper = mountPagination({ props: { page: 3, pageSize: 20, total: 137, showTotal: true } })

    expect(wrapper.get('[data-gr-pagination-total]').text()).toBe('41–60 of 137')

    const custom = mountPagination({
      props: { page: 3, pageSize: 20, total: 137, showTotal: true },
      slots: { total: '<template #total="{ from, to }">rows {{ from }}..{{ to }}</template>' },
    })

    expect(custom.get('[data-gr-pagination-total]').text()).toBe('rows 41..60')
  })

  it('последняя страница показывает неполный диапазон, пустой набор — нули', () => {
    const last = mountPagination({ props: { page: 7, pageSize: 20, total: 137, showTotal: true } })
    expect(last.get('[data-gr-pagination-total]').text()).toBe('121–137 of 137')

    const empty = mountPagination({ props: { page: 1, pageSize: 20, total: 0, showTotal: true } })
    expect(empty.get('[data-gr-pagination-total]').text()).toBe('0–0 of 0')
  })

  it('ariaLabel переопределяет имя лендмарка', () => {
    const wrapper = mountPagination({ props: { ariaLabel: 'Заказы' } })

    expect(wrapper.get('[role="navigation"]').attributes('aria-label')).toBe('Заказы')
  })

  it('disabled гасит номера, навигацию, селект и джампер', async () => {
    const wrapper = mountPagination({
      props: { disabled: true, showPageSize: true, showJumper: true },
    })

    expect(wrapper.findAll('[data-gr-pagination-page]').every(b => b.attributes('disabled') !== undefined)).toBe(true)
    expect(wrapper.get('[data-gr-pagination-jumper]').attributes('disabled')).toBeDefined()
    expect(wrapper.findComponent({ name: 'GrSelect' }).props('disabled')).toBe(true)
    for (const nav of ['next', 'last', 'prev', 'first'])
      expect(wrapper.get(`[data-gr-pagination-${nav}]`).attributes('disabled')).toBeDefined()

    await wrapper.findAll('[data-gr-pagination-page]')[0].trigger('click')
    expect(wrapper.emitted('update:page')).toBeFalsy()
  })
})

describe('GrPagination — семантика и объявления', () => {
  it('номера лежат в списке: по одному элементу на номер и на многоточие', () => {
    const wrapper = mountPagination({ props: { page: 6, pageSize: 10, total: 120 } })

    const list = wrapper.get('[data-gr-pagination-pages]')
    expect(list.element.tagName).toBe('UL')
    expect(list.attributes('role')).toBe('list')

    // [1] … [5 6 7] … [12] — семь элементов, многоточия спрятаны от диктора.
    const listItems = list.findAll('li')
    expect(listItems).toHaveLength(7)
    expect(listItems.filter(li => li.attributes('aria-hidden') === 'true')).toHaveLength(2)
  })

  it('смену страницы объявляет живая область: скрытая в обычном режиме, видимая в компактном', async () => {
    const wrapper = mountPagination({ props: { page: 3, pageSize: 20, total: 160 } })

    const status = wrapper.get('[data-gr-pagination-status]')
    expect(status.attributes('role')).toBe('status')
    expect(status.classes()).toContain('sr-only')
    expect(status.text()).toBe('Page 3 of 8')

    await wrapper.setProps({ page: 4 })
    expect(wrapper.get('[data-gr-pagination-status]').text()).toBe('Page 4 of 8')

    await wrapper.setProps({ compact: true })
    expect(wrapper.find('[data-gr-pagination-status]').exists()).toBe(false)
    const compact = wrapper.get('[data-gr-pagination-compact]')
    expect(compact.attributes('role')).toBe('status')
    expect(compact.text()).toBe('4 / 8')
  })
})

describe('GrPagination — крайние значения и клавиатура', () => {
  it('страница вне диапазона рендерится зажатой к границе', () => {
    const beyond = mountPagination({ props: { page: 99, pageSize: 20, total: 160 } })
    const beyondActive = beyond.findAll('[data-gr-pagination-page]').find(b => b.attributes('aria-current') === 'page')
    expect(beyondActive!.text()).toBe('8')
    expect(beyond.get('[data-gr-pagination-next]').attributes('disabled')).toBeDefined()

    const below = mountPagination({ props: { page: 0, pageSize: 20, total: 160 } })
    const belowActive = below.findAll('[data-gr-pagination-page]').find(b => b.attributes('aria-current') === 'page')
    expect(belowActive!.text()).toBe('1')
    expect(below.get('[data-gr-pagination-prev]').attributes('disabled')).toBeDefined()
  })

  it('pageSize=0 не уводит расчёт страниц в бесконечность', () => {
    const wrapper = mountPagination({ props: { page: 1, pageSize: 0, total: 160 } })

    // Делитель зажат к 1: 160 элементов — 160 страниц, а не Infinity.
    expect(wrapper.get('[data-gr-pagination-status]').text()).toBe('Page 1 of 160')
  })

  it('джампер применяет номер по Enter и по уходу фокуса, клампя его к диапазону', async () => {
    const wrapper = mountPagination({ props: { page: 1, pageSize: 20, total: 160, showJumper: true } })
    const jumper = wrapper.get('[data-gr-pagination-jumper]')

    await jumper.setValue('5')
    await jumper.trigger('keydown.enter')
    expect((jumper.element as HTMLInputElement).value).toBe('')

    await jumper.setValue('99')
    await jumper.trigger('blur')

    await jumper.setValue('не число')
    await jumper.trigger('keydown.enter')

    expect(wrapper.emitted('update:page')).toEqual([[5], [8]])
  })

  it('на первой странице prev/first недоступны, на последней — next/last', async () => {
    const wrapper = mountPagination({ props: { page: 1, pageSize: 20, total: 160 } })

    expect(wrapper.get('[data-gr-pagination-prev]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('[data-gr-pagination-first]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('[data-gr-pagination-next]').attributes('disabled')).toBeUndefined()

    await wrapper.setProps({ page: 8 })
    expect(wrapper.get('[data-gr-pagination-next]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('[data-gr-pagination-last]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('[data-gr-pagination-prev]').attributes('disabled')).toBeUndefined()
  })
})

describe('GrPagination — обязательный проп не доехал', () => {
  let warn: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    warn.mockRestore()
  })

  function warnings(): string {
    return warn.mock.calls.flat().join('\n')
  }

  it('без `page` рисует первую страницу, а не NaN', () => {
    const wrapper = mount(GrPagination, {
      props: { pageSize: 10, total: 50 } as unknown as GrPaginationProps,
    })

    expect(wrapper.html()).not.toContain('NaN')
    expect(wrapper.findAll('[data-gr-pagination-page]').map(b => b.text())).toEqual(['1', '2', '3', '4', '5'])
    expect(wrapper.get('[data-gr-pagination-status]').text()).toBe('Page 1 of 5')

    const active = wrapper.findAll('[data-gr-pagination-page]').find(b => b.attributes('aria-current') === 'page')
    expect(active!.text()).toBe('1')
    expect(warnings()).toContain('обязательный проп `page`')
  })

  it('без `total` диапазон и число страниц остаются числами', () => {
    const wrapper = mount(GrPagination, {
      props: { page: 1, pageSize: 10, showTotal: true } as unknown as GrPaginationProps,
    })

    expect(wrapper.get('[data-gr-pagination-total]').text()).toBe('0–0 of 0')
    expect(wrapper.get('[data-gr-pagination-status]').text()).toBe('Page 1 of 1')
    expect(warnings()).toContain('обязательный проп `total`')
  })

  it('`v-model` вместо `v-model:page` объясняется предупреждением', () => {
    const wrapper = mount(GrPagination, {
      props: { modelValue: 2, pageSize: 10, total: 50 } as unknown as GrPaginationProps,
    })

    // Необъявленный проп уезжает на корень — по этому следу дефект и находят.
    expect(wrapper.get('[role="navigation"]').attributes('modelvalue')).toBe('2')
    expect(warnings()).toContain('`v-model:page`, а не `v-model`')
  })
})

describe('GrPagination — размеры страницы своей подписью', () => {
  it('число задаёт подпись, равную значению', () => {
    const wrapper = mount(GrPagination, {
      props: { total: 100, pageSize: 10, showPageSize: true, pageSizes: [10, 50] },
    })

    const options = wrapper.findComponent({ name: 'GrSelect' }).props('options') as Array<{ value: string, label: string }>
    expect(options).toEqual([
      { value: '10', label: '10' },
      { value: '50', label: '50' },
    ])
  })

  /**
   * Ради этого проп и расширен: подпись «50 / стр.» из голого `number[]` было
   * не собрать, а свой `GrSelect` рядом терял связь с пагинацией.
   */
  it('пара задаёт свою подпись при том же значении', () => {
    const wrapper = mount(GrPagination, {
      props: {
        total: 100,
        pageSize: 10,
        showPageSize: true,
        pageSizes: [10, { value: 50, label: '50 / стр.' }],
      },
    })

    const options = wrapper.findComponent({ name: 'GrSelect' }).props('options') as Array<{ value: string, label: string }>
    expect(options).toEqual([
      { value: '10', label: '10' },
      { value: '50', label: '50 / стр.' },
    ])
  })
})

describe('GrPagination — рост коробки совпадает с GrButton', () => {
  /**
   * Номера и навигационные кнопки стоят в одном ряду: разойдись шкалы —
   * ряд поедет. Раньше `sm` и `md` были одной коробкой `h-8`, и кнопке
   * приходилось выдавать размер на ступень ниже собственного имени.
   */
  it('sm и md — разные коробки, и кнопке достаётся её же размер', () => {
    expect(pageBoxSizes.sm).toContain('h-8')
    expect(pageBoxSizes.md).toContain('h-10')
    expect(pageBoxSizes.sm).not.toBe(pageBoxSizes.md)

    for (const size of ['xs', 'sm', 'md', 'lg'] as const)
      expect(navButtonSizes[size]).toBe(size)
  })
})
