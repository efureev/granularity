// Node-entry granular-provider'а `@feugene/granularity-datepicker`.
//
// От browser-варианта (`./index.ts`) отличается только тем, что в
// `dependencies` подставляется node-инстанс `granularityProvider` (с
// `tokenDefinitions`, вычисленными через FS) — чтобы у `presetGranularNode`
// был ровно один инстанс провайдера с данным `id`.
import { granularityProvider } from '@feugene/granularity/granular-provider/node'

import { createGranularityDatepickerProvider } from './shared'

export { GRANULARITY_DATEPICKER_PROVIDER_ID } from './shared'

export const granularityDatepickerProvider = createGranularityDatepickerProvider(granularityProvider)

export default granularityDatepickerProvider
