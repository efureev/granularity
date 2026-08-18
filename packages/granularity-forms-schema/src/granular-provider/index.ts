// Browser-entry granular-provider'а `@feugene/granularity-forms-schema`.
//
// Подключается вместе с ядром в опцию `providers` пресета:
//
// ```ts
// presetGranularNode({
//   providers: [granularityProvider, granularityFormsSchemaProvider],
//   components: ['@feugene/granularity-forms-schema:GrSchemaForm'],
// })
// ```
import { granularityProvider } from '@feugene/granularity/granular-provider'
import { resolvePackageBaseUrl } from '@feugene/unocss-preset-granular/contract'

import { createGranularityFormsSchemaProvider } from './shared'

/**
 * База пакета считается здесь, а не в `shared`: место entry-файла в `dist`
 * задано конфигом сборки, а общий модуль бандлер волен и вынести в чанк, и
 * заинлайнить — глубина оказалась бы разной.
 *
 * Не заменять на `new URL('.', import.meta.url)`: сборщик распознаёт этот
 * литерал и подставляет `data:`-URL, после чего scan-директории пустеют.
 */
const packageBaseUrl = resolvePackageBaseUrl(import.meta.url, 0)

export * from './shared'

export const granularityFormsSchemaProvider = createGranularityFormsSchemaProvider(
  granularityProvider,
  packageBaseUrl,
)

export default granularityFormsSchemaProvider
