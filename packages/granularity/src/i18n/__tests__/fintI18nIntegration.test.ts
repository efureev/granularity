import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { createFintI18n } from '@feugene/fint-i18n/core'

import { GRANULARITY_I18N_BLOCK } from '../messages/const'
import { ru } from '../messages/ru'
import GrPagination from '../../components/GrPagination/GrPagination.vue'

/**
 * Единственный e2e-тест моста granularity ↔ fint-i18n с НАСТОЯЩЕЙ библиотекой
 * (остальные тесты используют рукописный мок-адаптер и не поймают ни смену
 * сигнатуры `t()`, ни расхождение `Symbol.for('FintI18n')`, ни несовпадение
 * структуры locale-JSON с ключами, которые запрашивают компоненты).
 */
describe('granularity + fint-i18n (реальный инстанс)', () => {
  it('компонент резолвит переводы через Symbol.for("FintI18n"), включая параметризованные ключи', async () => {
    const i18n = createFintI18n({
      locale: 'ru',
      loaders: [ru],
    })
    i18n.registerBlocks([GRANULARITY_I18N_BLOCK])
    await i18n.loadUsedBlocks('ru')

    const wrapper = mount(GrPagination, {
      props: { page: 6, pageSize: 10, total: 120 },
      global: {
        provide: {
          // Тот же глобальный символ, что кладёт installI18n() из @feugene/fint-i18n/vue.
          [Symbol.for('FintI18n')]: i18n,
        },
      },
    })

    expect(wrapper.get('[role="navigation"]').attributes('aria-label')).toBe('Пагинация')
    expect(wrapper.text()).toContain('Назад')
    expect(wrapper.text()).toContain('Вперёд')

    const pageLabels = wrapper.findAll('[data-gr-pagination-page]').map(b => b.attributes('aria-label'))
    expect(pageLabels).toContain('Страница 6')
  })
})
