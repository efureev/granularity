import { createGranularResolver } from '@feugene/unplugin-granularity'
import type { ComponentResolver } from 'unplugin-vue-components/types'

import { GRANULARITY_DASHBOARD_COMPONENTS } from './componentNames'

/** Имя npm-пакета — источника компонентов. Совпадает с `package.json#name`. */
export const GRANULARITY_DASHBOARD_PACKAGE_NAME = '@feugene/granularity-dashboard'

/**
 * Резолвер `unplugin-vue-components` для `@feugene/granularity-dashboard`.
 *
 * Список имён — whitelist, а не префикс `Gr*`: компоненты пакета начинаются с
 * того же префикса, что и ядерные, и жадный core-резолвер перехватил бы их,
 * импортировав из несуществующего пути внутри `@feugene/granularity`.
 *
 * ⚠️ Ставьте его **перед** `GranularityResolver()` ядра — точный список должен
 * отработать первым.
 *
 * `importStyle: false` — CSS компонента инлайнится в его JS-чанк
 * (`vite-plugin-lib-inject-css`), отдельного side-effect импорта стилей нет.
 */
export function GranularityDashboardResolver(): ComponentResolver {
  return createGranularResolver({
    packageName: GRANULARITY_DASHBOARD_PACKAGE_NAME,
    components: GRANULARITY_DASHBOARD_COMPONENTS,
    importStyle: false,
  })
}
