// Node-entry granular-provider'а `@feugene/extra-granularity`.
//
// От browser-варианта (`./index.ts`) отличается только тем, что в
// `dependencies` подставляется node-инстанс `granularityProvider` (с
// `tokenDefinitions`, вычисленными через FS) — чтобы у `presetGranularNode`
// был ровно один инстанс провайдера с данным `id`. Всё остальное —
// `id`, `packageBaseUrl`, список компонентов — приходит из общей фабрики
// `./shared`.
import {granularityProvider} from '@feugene/granularity/granular-provider/node'

import {createExtraGranularityProvider} from './shared'

export {EXTRA_GRANULARITY_PROVIDER_ID} from './shared'

export const extraGranularityProvider = createExtraGranularityProvider(granularityProvider)

export default extraGranularityProvider
