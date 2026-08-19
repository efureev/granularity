import { createFintI18n } from '@feugene/fint-i18n/core'
import { GRANULARITY_I18N_BLOCK, ru as coreRu } from '@feugene/granularity/i18n'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { fintI18nGlobal } from '@feugene/granularity-test-kit/vue'

import GrChartLine from '../../components/GrChartLine/GrChartLine.vue'
import GrSparkline from '../../components/GrSparkline/GrSparkline.vue'
import { en, GR_CHARTS_I18N_BLOCK, ru } from '../messages'

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

  i18n.registerBlocks([GRANULARITY_I18N_BLOCK, GR_CHARTS_I18N_BLOCK])
  await i18n.loadUsedBlocks(locale)

  return i18n
}

const series = [{ id: 'a', label: 'Продажи', y: [1, 2, 3] }]

describe('granularity-charts + fint-i18n (реальный инстанс)', () => {
  it('строки пакета доезжают до компонента', async () => {
    const i18n = await createI18n('ru')
    const wrapper = mount(GrChartLine, { props: { series }, global: fintI18nGlobal(i18n) })

    expect(wrapper.find('[data-gr-chart-surface]').attributes('aria-roledescription')).toBe('Линейный график')
    expect(wrapper.find('[data-gr-chart-table] caption').text()).toBe('Данные графика')
    wrapper.unmount()
  })

  it('словарь пакета и словарь ядра — разные блоки и не мешают друг другу', async () => {
    const i18n = await createI18n('ru')

    expect(i18n.t('grCharts.chart.empty')).toBe('Нет данных')
    expect(i18n.t('gr.common.clear'), 'ключ ядра на месте').not.toBe('gr.common.clear')
    expect(i18n.t('gr.chart.empty'), 'в блоке ядра ключей пакета нет').toBe('gr.chart.empty')
  })

  it('сводка спарклайна собирается из локали, а не из английского fallback', async () => {
    const i18n = await createI18n('ru')
    const wrapper = mount(GrSparkline, { props: { data: [1, 5] }, global: fintI18nGlobal(i18n) })

    expect(wrapper.attributes('aria-label')).toContain('рост')
    wrapper.unmount()
  })

  it('перевода нет — остаётся английский fallback, а не пустота', async () => {
    // Обратная половина: без неё гейт зеленел бы и на словаре, из которого
    // выкинули половину ключей.
    const i18n = await createI18n('en')
    const wrapper = mount(GrChartLine, { props: { series: [] }, global: fintI18nGlobal(i18n) })

    expect(wrapper.text()).toContain('No data')
    wrapper.unmount()
  })
})
