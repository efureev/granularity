import { createGranularResolver } from '@feugene/unplugin-granularity'
import type { ComponentResolver } from 'unplugin-vue-components/types'

import { GRANULARITY_FORMS_SCHEMA_COMPONENTS } from './componentNames'

export const GRANULARITY_FORMS_SCHEMA_PACKAGE_NAME = '@feugene/granularity-forms-schema'

/**
 * Резолвер авто-импорта.
 *
 * Whitelist, а не префикс: компоненты пакета тоже начинаются на `Gr*`, и жадный
 * резолвер ядра перехватил бы их, импортируя из несуществующего пути.
 * Регистрируется **раньше** `GranularityResolver()`.
 *
 * `GrSchemaField` и `GrSchemaArrayField` перечислены отдельно: они экспортируются
 * из того же subpath, что и форма, но в шаблоне пишутся своими именами.
 */
export function GranularityFormsSchemaResolver(): ComponentResolver {
  return createGranularResolver({
    packageName: GRANULARITY_FORMS_SCHEMA_PACKAGE_NAME,
    components: [...GRANULARITY_FORMS_SCHEMA_COMPONENTS],
    importStyle: false,
  })
}
