// Browser-entry granular-provider'а `@feugene/granularity-datepicker`.
//
// Подключается вместе с `@feugene/granularity` в опцию `providers` пресета:
//
// ```ts
// presetGranularNode({
//   providers: [granularityProvider, granularityDatepickerProvider],
//   components: ['@feugene/granularity-datepicker:GrDateTimePicker'],
// })
// ```
import { granularityProvider } from '@feugene/granularity/granular-provider'

import { createGranularityDatepickerProvider } from './shared'

export { GRANULARITY_DATEPICKER_PROVIDER_ID } from './shared'

export const granularityDatepickerProvider = createGranularityDatepickerProvider(granularityProvider)

export default granularityDatepickerProvider
