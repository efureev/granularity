// Browser-entry granular-provider'а `@feugene/granularity-charts`.
//
// Подключается вместе с `@feugene/granularity` в опцию `providers` пресета:
//
// ```ts
// presetGranularNode({
//   providers: [granularityProvider, granularityChartsProvider],
//   components: ['@feugene/granularity-charts:GrChartLine'],
// })
// ```
import { granularityProvider } from '@feugene/granularity/granular-provider'
import { resolvePackageBaseUrl } from '@feugene/unocss-preset-granular/contract'

import { createGranularityChartsProvider } from './shared'

/**
 * База пакета считается здесь, а не в `shared`: место entry-файла в `dist`
 * задано конфигом сборки, а общий модуль бандлер волен и вынести в чанк, и
 * заинлайнить сюда — глубина оказалась бы разной.
 *
 * `levelsUp: 0` — сам каталог файла, то есть `dist/`, где и лежат
 * `components/<Name>/`. Не заменять на `new URL('.', import.meta.url)`: Vite и
 * rolldown распознают этот литерал и подставляют `data:`-URL, после чего
 * scan-директории пустеют.
 */
const packageBaseUrl = resolvePackageBaseUrl(import.meta.url, 0)

// Реэкспортом, как в ядре: реестр компонентов — публичная информация о пакете,
// и по нему строятся списки на стороне потребителя (например цели e2e витрины).
export * from './shared'

export const granularityChartsProvider = createGranularityChartsProvider(granularityProvider, packageBaseUrl)

export default granularityChartsProvider
