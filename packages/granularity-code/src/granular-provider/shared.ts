// `id`, `packageBaseUrl` и реестр компонентов провайдера.
//
// Списки под маркерами генерируются `yarn generate:registry` — руками внутри
// них не писать, следующая генерация затрёт.
import {
  defineGranularProvider,
  type GranularComponentDescriptor,
  type GranularProvider,
} from '@feugene/unocss-preset-granular/contract'
// <granularity:components:imports> — блок генерируется `yarn generate:registry`
import { grCodeBlockConfig } from '../components/GrCodeBlock/config'
import { grCodeEditorConfig } from '../components/GrCodeEditor/config'
import { grDiffConfig } from '../components/GrDiff/config'
// </granularity:components:imports>

/** Идентификатор провайдера — совпадает с именем пакета. */
export const GRANULARITY_CODE_PROVIDER_ID = '@feugene/granularity-code'

/** Реестр компонентов пакета — именованной мапой, по ней сверяется гейт реестров. */
export const granularityCodeComponentConfigs = {
  // <granularity:components:registry> — блок генерируется `yarn generate:registry`
  GrCodeBlock: grCodeBlockConfig,
  GrCodeEditor: grCodeEditorConfig,
  GrDiff: grDiffConfig,
  // </granularity:components:registry>
} satisfies Record<string, GranularComponentDescriptor>

export type GranularityCodeComponentName = keyof typeof granularityCodeComponentConfigs

/**
 * Собирает granular-provider пакета.
 *
 * `packageBaseUrl` приходит снаружи, из самого entry: он считается от
 * `import.meta.url`, а этот модуль бандлер волен и вынести в общий чанк, и
 * заинлайнить в entry — то есть положить на разную глубину. Промах на уровень
 * даёт `dist/components/<Name>/`, которых нет, пресет молча пропускает скан, и
 * в CSS остаётся только то, что перечислено в safelist.
 */
export function createGranularityCodeProvider(
  granularityProvider: GranularProvider,
  packageBaseUrl: string,
): GranularProvider {
  return defineGranularProvider({
    id: GRANULARITY_CODE_PROVIDER_ID,
    contractVersion: 1,
    packageBaseUrl,
    components: Object.values(granularityCodeComponentConfigs),
    dependencies: [granularityProvider],
  })
}
