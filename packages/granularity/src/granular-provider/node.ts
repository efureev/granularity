// Node-entry granular-provider'а `@feugene/granularity`.
//
// От browser-варианта (`./index.ts`) отличается только тем, что для
// `DsButton` используется `config.node.ts` с `tokenDefinitions`,
// собранными через `tokenDefinitionsFromCssSync` (требует `node:fs`).
// Всё остальное — id, `theme.*`, список компонентов, `packageBaseUrl` —
// приходит из общей фабрики `./shared`.
import { dsButtonConfig } from '../components/DsButton/config.node'
import { createGranularityProvider } from './shared'

export { GRANULARITY_PROVIDER_ID } from './shared'

export const granularityProvider = createGranularityProvider([dsButtonConfig])

export default granularityProvider
