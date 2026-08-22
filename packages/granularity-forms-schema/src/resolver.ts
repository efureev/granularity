import { createGranularResolver } from '@feugene/unplugin-granularity'
import type { ComponentResolver } from 'unplugin-vue-components/types'

import { GRANULARITY_FORMS_SCHEMA_COMPONENTS, GRANULARITY_FORMS_SCHEMA_SUBCOMPONENTS } from './componentNames'

export const GRANULARITY_FORMS_SCHEMA_PACKAGE_NAME = '@feugene/granularity-forms-schema'

/**
 * Резолвер авто-импорта.
 *
 * Whitelist, а не префикс: компоненты пакета тоже начинаются на `Gr*`, и жадный
 * резолвер ядра перехватил бы их, импортируя из несуществующего пути.
 * Регистрируется **раньше** `GranularityResolver()`.
 *
 * Части формы (`GrSchemaField`, `GrSchemaArrayField` и соседи) идут вторым
 * списком: своей entry у них нет, но в шаблоне они пишутся своими именами, и
 * без whitelist их перехватил бы жадный резолвер ядра — в subpath, которого у
 * ядра нет вовсе.
 */
export function GranularityFormsSchemaResolver(): ComponentResolver {
  return createGranularResolver({
    packageName: GRANULARITY_FORMS_SCHEMA_PACKAGE_NAME,
    components: [...GRANULARITY_FORMS_SCHEMA_COMPONENTS, ...GRANULARITY_FORMS_SCHEMA_SUBCOMPONENTS],
    importStyle: false,
  })
}
