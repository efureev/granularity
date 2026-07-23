import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { GRANULARITY_I18N_KEY, type GranularityI18nAdapter } from '../../../i18n/adapter'
import GrPagination from '../GrPagination.vue'

type PaginationMountOptions = {
  locale?: 'en' | 'ru'
  props?: {
    page?: number
    pageSize?: number
    total?: number
    pageSizes?: number[]
  }
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
    global: i18n
      ? {
          provide: {
            [GRANULARITY_I18N_KEY as symbol]: i18n,
          },
        }
      : undefined,
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
      },
    })
    const select = wrapper.findComponent({ name: 'GrSelect' })

    expect(select.exists()).toBe(true)

    await select.vm.$emit('update:modelValue', '50')

    expect(wrapper.emitted('update:pageSize')).toEqual([[50]])
  })

  it('использует переводы из granular i18n адаптера', () => {
    const wrapper = mountPagination({ locale: 'ru' })

    expect(wrapper.text()).toContain('Назад')
    expect(wrapper.text()).toContain('Вперёд')
    expect(wrapper.findComponent({ name: 'GrSelect' }).props('ariaLabel')).toBe('Размер страницы')
  })

  it('aria-label региона навигации не путается с лейблом page-size селекта', () => {
    const wrapper = mountPagination()

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