// Browser-entry granular-provider'а `@feugene/extra-granularity`.
//
// Подключается вместе с `@feugene/granularity` в опцию `providers` пресета:
//
// ```ts
// presetGranularNode({
//   providers: [granularityProvider, extraGranularityProvider],
//   components: ['@feugene/extra-granularity:XgQuickForm'],
// })
// ```
//
// Композитные компоненты декларируют свои зависимости на примитивы
// granularity через `dependencies` в `config.ts` — ядро пресета рекурсивно
// соберёт safelist и CSS всех транзитивных компонентов.
import {granularityProvider} from '@feugene/granularity/granular-provider'

import {createExtraGranularityProvider} from './shared'

export {EXTRA_GRANULARITY_PROVIDER_ID} from './shared'

export const extraGranularityProvider = createExtraGranularityProvider(granularityProvider)

export default extraGranularityProvider
