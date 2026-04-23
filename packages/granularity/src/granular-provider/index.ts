// Browser-entry granular-provider'а `@feugene/granularity`.
//
// Использует облегчённый `DsButton/config.ts` без `tokenDefinitionsFromCssSync`,
// поэтому при сборке клиентских приложений из этого модуля не протягиваются
// `node:fs`/`node:url`/`node:path`.
//
// Для node-сборок UnoCSS, где нужны точечные token overrides из CSS-файлов
// тем, используйте `./node.ts` — там в `DsButton` подставляется
// `config.node.ts` с `tokenDefinitionsFromCssSync`.
import {createGranularityProvider} from './shared'

export * from './shared'

export const granularityProvider = createGranularityProvider()

export default granularityProvider
