import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { describe, expect, it } from 'vitest'

import { fintI18nGlobal } from '@feugene/granularity-test-kit/vue'

import { createFintI18n } from '@feugene/fint-i18n/core'
import { GRANULARITY_I18N_BLOCK, ru as coreRu } from '@feugene/granularity/i18n'

import GrCalendar from '../../components/GrCalendar/GrCalendar.vue'
import GrDatePicker from '../../components/GrDatePicker/GrDatePicker.vue'
import { en, GR_CHRONO_I18N_BLOCK, ru } from '../messages'

/**
 * Мост «пакет ↔ приложение» на **настоящем** `fint-i18n`.
 *
 * Гейта такого класса у пакета не было, и это стоило ровно того, ради чего он
 * пишется: словарь лежал сырым JSON, подключить его к приложению было нечем, и
 * компоненты во всех языках показывали английский fallback из `t(key, fallback)`.
 * Ошибки при этом не возникало нигде — ни в сборке, ни в тестах, ни в консоли.
 *
 * Мок-адаптер этого не ловит по построению: он отвечает на любой ключ. Здесь
 * проверяется стык — имя блока, форма коллекции лоадеров и совпадение структуры
 * JSON с ключами, которые спрашивает компонент.
 */

const TODAY = { y: 2026, m: 7, d: 12 }

async function createI18n(locale: string) {
  const i18n = createFintI18n({ locale, loaders: [coreRu, en, ru] })
  i18n.registerBlocks([GRANULARITY_I18N_BLOCK, GR_CHRONO_I18N_BLOCK])
  await i18n.loadUsedBlocks(locale)

  return i18n
}

describe('granularity-chrono + fint-i18n (реальный инстанс)', () => {
  it('строки пакета доезжают до компонента', async () => {
    const i18n = await createI18n('ru')

    const wrapper = mount(GrCalendar, {
      props: { today: TODAY, viewDate: TODAY, locale: 'ru' },
      global: fintI18nGlobal(i18n),
    })

    expect(wrapper.get('[data-gr-calendar-prev]').attributes('aria-label')).toBe('Предыдущий месяц')
    expect(wrapper.get('[data-gr-calendar-next]').attributes('aria-label')).toBe('Следующий месяц')
    wrapper.unmount()
  })

  it('словарь пакета и словарь ядра — разные блоки и не мешают друг другу', async () => {
    // Свой блок вместо чужого: иначе первое же совпадение верхнего ключа
    // столкнуло бы словари молча.
    const i18n = await createI18n('ru')

    expect(i18n.t('grChrono.calendar.previousMonth')).toBe('Предыдущий месяц')
    expect(i18n.t('gr.common.clear'), 'ключ ядра на месте').not.toBe('gr.common.clear')
    expect(i18n.t('gr.calendar.previousMonth'), 'в блоке ядра ключей пакета нет').toBe('gr.calendar.previousMonth')
  })

  it('панель пикера подписана строками пакета', async () => {
    const i18n = await createI18n('ru')

    const wrapper = mount(GrDatePicker, {
      props: { today: new Date(2026, 7, 12), locale: 'ru', open: true },
      attachTo: document.body,
      global: fintI18nGlobal(i18n),
    })
    for (let i = 0; i < 4; i += 1) await nextTick()

    expect(document.querySelector('[data-gr-date-picker-panel]')).not.toBeNull()
    expect(wrapper.get('[data-gr-date-picker-field]').attributes('aria-label')).toBeUndefined()
    expect(document.querySelector('[data-gr-calendar-grid]')?.getAttribute('aria-label')).toBe('Календарь')
    wrapper.unmount()
  })

  it('перевода нет — остаётся английский fallback, а не пустота', async () => {
    // Обратная половина: без неё гейт зеленел бы и на словаре, из которого
    // выкинули половину ключей.
    const i18n = await createI18n('en')

    const wrapper = mount(GrCalendar, {
      props: { today: TODAY, viewDate: TODAY, locale: 'en' },
      global: fintI18nGlobal(i18n),
    })

    expect(wrapper.get('[data-gr-calendar-prev]').attributes('aria-label')).toBe('Previous month')
    wrapper.unmount()
  })
})
