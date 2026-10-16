import { createGranularResolver } from '@feugene/unplugin-granularity'
import type { ComponentResolver } from 'unplugin-vue-components/types'

import { GRANULARITY_FORMS_SCHEMA_COMPONENTS, GRANULARITY_FORMS_SCHEMA_SUBCOMPONENTS } from './componentNames'

export const GRANULARITY_FORMS_SCHEMA_PACKAGE_NAME = '@feugene/granularity-forms-schema'

/**
 * Резолвер `unplugin-vue-components` для `@feugene/granularity-forms-schema` — явный список его
 * компонентов.
 *
 * Новому конфигу он не нужен: `GranularityResolver()` из
 * `@feugene/unplugin-granularity` `>=1.1.0` находит пакет в `package.json`
 * приложения и резолвит ядро вместе со спутниками, в любом порядке. Этот
 * резолвер остаётся для уже написанных конфигов и работает рядом с единым.
 *
 * `importStyle: false` — CSS компонента доставляет granum из манифеста пакета.
 *
 * Части формы (`GrSchemaField`, `GrSchemaArrayField` и соседи) идут вторым
 * списком: в шаблоне они пишутся своими именами.
 */
export function GranularityFormsSchemaResolver(): ComponentResolver {
  return createGranularResolver({
    packageName: GRANULARITY_FORMS_SCHEMA_PACKAGE_NAME,
    components: [...GRANULARITY_FORMS_SCHEMA_COMPONENTS, ...GRANULARITY_FORMS_SCHEMA_SUBCOMPONENTS],
    importStyle: false,
  })
}
