// Browser-entry granular-provider'а `@feugene/granularity-dashboard`.
//
// Подключается вместе с `@feugene/granularity` в опцию `providers` пресета:
//
// ```ts
// presetGranularNode({
//   providers: [granularityProvider, granularityDashboardProvider],
//   components: ['@feugene/granularity-dashboard:GrDashboard'],
// })
// ```
import { granularityProvider } from '@feugene/granularity/granular-provider'
import { resolvePackageBaseUrl } from '@feugene/unocss-preset-granular/contract'

import { createGranularityDashboardProvider } from './shared'

/**
 * База пакета считается здесь, а не в `shared`: entry собирается в плоский
 * `dist/granular-provider.js`, поэтому `levelsUp: 0` — это сам каталог файла,
 * то есть `dist/`, где и лежат `components/<Name>/` и `groups/<Group>/`.
 *
 * Не заменять на `new URL('.', import.meta.url)`: vite и rolldown распознают
 * этот литерал и подставляют `data:`-URL, после чего scan-директории пустеют.
 */
const packageBaseUrl = resolvePackageBaseUrl(import.meta.url, 0)

export * from './shared'

export const granularityDashboardProvider = createGranularityDashboardProvider(
  granularityProvider,
  packageBaseUrl,
)

export default granularityDashboardProvider
