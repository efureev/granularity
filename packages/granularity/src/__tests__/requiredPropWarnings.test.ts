import { renderToString } from '@vue/server-renderer'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createSSRApp } from 'vue'

import GrBreadcrumbs from '../components/GrBreadcrumbs/GrBreadcrumbs.vue'
import GrDataTable from '../components/GrDataTable/GrDataTable.vue'
import GrInputTag from '../components/GrInputTag/GrInputTag.vue'
import GrNumberInput from '../components/GrNumberInput/GrNumberInput.vue'
import GrSegmented from '../components/GrSegmented/GrSegmented.vue'
import GrSortableList from '../components/GrSortableList/GrSortableList.vue'
import GrSteps from '../components/GrSteps/GrSteps.vue'
import GrTabs from '../components/GrTabs/GrTabs.vue'
import GrTransfer from '../components/GrTransfer/GrTransfer.vue'

/**
 * Пропущенный обязательный проп у этих восьми кончается исключением при
 * отрисовке, и до гардов потребитель видел только `Cannot read properties of
 * undefined`. Имени компонента и пропа там нет, а от Vue их ждать нечего:
 * production-сборка SFC снимает `required` с рантайм-объявления, и «Missing
 * required prop» не печатается ни в dev, ни в prod.
 *
 * Гард не подменяет значение и падения не отменяет — он называет виновника
 * раньше, чем оно случится.
 */
const CASES = [
  { name: 'GrBreadcrumbs', component: GrBreadcrumbs, props: ['items'] },
  { name: 'GrDataTable', component: GrDataTable, props: ['rows', 'columns'] },
  { name: 'GrInputTag', component: GrInputTag, props: ['modelValue'] },
  { name: 'GrNumberInput', component: GrNumberInput, props: ['modelValue'] },
  { name: 'GrSegmented', component: GrSegmented, props: ['modelValue', 'options'] },
  { name: 'GrSortableList', component: GrSortableList, props: ['modelValue'] },
  { name: 'GrSteps', component: GrSteps, props: ['modelValue', 'steps'] },
  { name: 'GrTabs', component: GrTabs, props: ['modelValue', 'tabs'] },
  { name: 'GrTransfer', component: GrTransfer, props: ['modelValue', 'items'] },
] as const

afterEach(() => {
  vi.restoreAllMocks()
})

/**
 * Рендер серверный, а не `mount`: гард живёт в setup, а клиентское
 * монтирование вдобавок заводит `onMounted`. У `GrSegmented` тот через
 * `nextTick` меряет индикатор и падает уже вне `try`, оставляя необработанный
 * reject, — прогон краснел бы при всех зелёных тестах.
 */
async function warningsFromBareRender(component: unknown): Promise<string> {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const app = createSSRApp(component as never)
  app.config.warnHandler = () => {}

  try {
    // Падение ожидаемо и не проверяется: гард обязан отработать до него.
    await renderToString(app)
  }
  catch {}

  return warn.mock.calls.map(call => String(call[0])).join('\n')
}

describe('обязательные пропы: гард называет виновника до падения', () => {
  it.each(CASES.map(entry => [entry.name, entry] as const))('%s', async (_name, entry) => {
    const printed = await warningsFromBareRender(entry.component)

    for (const prop of entry.props)
      expect(printed).toContain(`[granularity] ${entry.name}: обязательный проп \`${prop}\``)
  })
})
