import { createFintI18n } from '@feugene/fint-i18n/core'
import { GRANULARITY_I18N_BLOCK, ru as coreRu } from '@feugene/granularity/i18n'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { fintI18nGlobal } from '@feugene/granularity-test-kit/vue'
import { defineComponent, h, ref } from 'vue'

import type { GrDashboardResponsiveLayout } from '../../layout'
import GrDashboard from '../../components/GrDashboard/GrDashboard.vue'
import GrDashboardItem from '../../components/GrDashboardItem/GrDashboardItem.vue'
import GrDashboardToolbar from '../../components/GrDashboardToolbar/GrDashboardToolbar.vue'
import { en, GR_DASHBOARD_I18N_BLOCK, ru } from '../messages'

/**
 * Мост «пакет ↔ приложение» на **настоящем** `fint-i18n`.
 *
 * Мок-адаптер этого не ловит по построению: он отвечает на любой ключ. Здесь
 * проверяется стык — имя блока, форма коллекции лоадеров и совпадение
 * структуры JSON с ключами, которые спрашивает компонент. Ровно на этом стыке
 * соседний пакет полгода показывал английский во всех языках: ошибки не было
 * нигде — ни в сборке, ни в тестах, ни в консоли.
 */

async function createI18n(locale: string) {
  const i18n = createFintI18n({ locale, loaders: [coreRu, en, ru] })

  i18n.registerBlocks([GRANULARITY_I18N_BLOCK, GR_DASHBOARD_I18N_BLOCK])
  await i18n.loadUsedBlocks(locale)

  return i18n
}

function stand(mode: 'view' | 'edit') {
  const layout = ref<GrDashboardResponsiveLayout>({ lg: [{ id: 'sales', x: 0, y: 0, w: 4, h: 2 }] })

  return defineComponent({
    setup: () => () => h(
      GrDashboard,
      { layout: layout.value, mode },
      () => [h(GrDashboardItem, { itemId: 'sales', title: 'Продажи' })],
    ),
  })
}

describe('granularity-dashboard + fint-i18n (реальный инстанс)', () => {
  it('строки пакета доезжают до компонента', async () => {
    const i18n = await createI18n('ru')
    const wrapper = mount(stand('edit'), { global: fintI18nGlobal(i18n) })

    const handle = wrapper.find('[data-gr-dashboard-drag-handle]')
    expect(handle.attributes('aria-label')).toContain('Переместить')
    wrapper.unmount()
  })

  it('словарь пакета и словарь ядра — разные блоки и не мешают друг другу', async () => {
    const i18n = await createI18n('ru')

    expect(i18n.t('grDashboard.toolbar.reset')).toBe('Сбросить раскладку')
    expect(i18n.t('gr.common.clear'), 'ключ ядра на месте').not.toBe('gr.common.clear')
    expect(i18n.t('gr.dashboard.label'), 'в блоке ядра ключей пакета нет').toBe('gr.dashboard.label')
  })

  it('панель управления берёт подписи кнопок из локали', async () => {
    const i18n = await createI18n('ru')
    const wrapper = mount(GrDashboardToolbar, { props: { mode: 'view', resettable: true }, global: fintI18nGlobal(i18n) })

    expect(wrapper.text()).toContain('Настроить раскладку')
    expect(wrapper.text()).toContain('Сбросить раскладку')
    wrapper.unmount()
  })

  it('перевода нет — остаётся английский fallback, а не пустота', async () => {
    // Обратная половина: без неё гейт зеленел бы и на словаре, из которого
    // выкинули половину ключей.
    const i18n = await createI18n('en')
    const wrapper = mount(GrDashboardToolbar, { props: { mode: 'view' }, global: fintI18nGlobal(i18n) })

    expect(wrapper.text()).toContain('Edit layout')
    wrapper.unmount()
  })
})
