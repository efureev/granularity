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
  it('рендерит окно страниц вокруг активной страницы', () => {
    const wrapper = mountPagination({
      props: {
        page: 6,
        pageSize: 10,
        total: 120,
      },
    })

    const pageButtons = wrapper.findAll('button[type="button"]')
    const numericButtons = pageButtons.slice(1, -1)

    expect(numericButtons.map(button => button.text())).toEqual(['4', '5', '6', '7', '8'])
    expect(numericButtons[2].classes()).toContain('bg-[var(--primary)]')
  })

  it('эмитит изменение страницы по кнопкам навигации и номеру страницы', async () => {
    const wrapper = mountPagination()
    const pageButtons = wrapper.findAll('button[type="button"]')

    await pageButtons[0].trigger('click')
    await pageButtons[3].trigger('click')
    await pageButtons[pageButtons.length - 1].trigger('click')

    expect(wrapper.emitted('update:page')).toEqual([[2], [3], [4]])
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
})