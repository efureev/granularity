// Node-entry granular-provider'а `@feugene/granularity`.
//
// От browser-варианта (`./index.ts`) отличается только тем, что для
// `GrButton` используется `config.node.ts` с `tokenDefinitions`,
// собранными через `tokenDefinitionsFromCssSync` (требует `node:fs`).
// Всё остальное — id, `theme.*`, список компонентов, `packageBaseUrl` —
// приходит из общей фабрики `./shared`.
import { grButtonConfig } from '../components/GrButton/config.node'
import { grProgressBarConfig } from '../components/GrProgressBar/config.node'
import { createGranularityProvider } from './shared'

export * from './shared'

export const granularityProvider = createGranularityProvider([grButtonConfig, grProgressBarConfig])

export default granularityProvider
