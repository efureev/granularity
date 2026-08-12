// Browser-entry granular-provider'а `@feugene/granularity-chrono`.
//
// Подключается вместе с `@feugene/granularity` в опцию `providers` пресета:
//
// ```ts
// presetGranularNode({
//   providers: [granularityProvider, granularityChronoProvider],
//   components: ['@feugene/granularity-chrono:GrCalendar'],
// })
// ```
import { granularityProvider } from '@feugene/granularity/granular-provider'

import { createGranularityChronoProvider } from './shared'

export { GRANULARITY_CHRONO_PROVIDER_ID } from './shared'

export const granularityChronoProvider = createGranularityChronoProvider(granularityProvider)

export default granularityChronoProvider
