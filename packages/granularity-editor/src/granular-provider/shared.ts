// `id` и реестр компонентов провайдера.
//
// Списки под маркерами генерируются `yarn generate:registry` — руками внутри
// них не писать, следующая генерация затрёт.
import {
  defineGranumProvider,
  type GranumComponentDescriptor,
  type GranumProvider,
} from '@feugene/granum/contract'
// <granularity:components:imports> — блок генерируется `yarn generate:registry`
import { grMarkdownConfig } from '../components/GrMarkdown/config'
import { grRichTextConfig } from '../components/GrRichText/config'
// </granularity:components:imports>

/** Идентификатор провайдера — совпадает с именем пакета. */
export const GRANULARITY_EDITOR_PROVIDER_ID = '@feugene/granularity-editor'

/** Донор: компоненты пакета опираются на компоненты ядра. */
const GRANULARITY_CORE_PROVIDER_ID = '@feugene/granularity'

/**
 * Словарь утилит, против которого написаны классы компонентов, — тот же, что у
 * ядра. Сборка сверит объявление с диалектом движка, которым её запустили, и не
 * даст записать в манифест чужой словарь.
 */
export const GRANULARITY_EDITOR_ENGINE_DIALECT = 'unocss/preset-wind3+granum@66'

/**
 * Реестр компонентов пакета — именованной мапой, а не инлайн-массивом.
 *
 * Именно по нему гейт реестров сверяет состав с файловой системой, а
 * генератор — раскладывает компонент по четырём спискам. Инлайн-массив
 * (как в `granularity-datepicker`) зацепиться было бы не за что.
 */
export const granularityEditorComponentConfigs = {
  // <granularity:components:registry> — блок генерируется `yarn generate:registry`
  GrMarkdown: grMarkdownConfig,
  GrRichText: grRichTextConfig,
  // </granularity:components:registry>
} satisfies Record<string, GranumComponentDescriptor>

export type GranularityEditorComponentName = keyof typeof granularityEditorComponentConfigs

/**
 * Собирает провайдера пакета.
 *
 * Донор объявлен строкой, а не инстансом: приложение подключает оба пакета по
 * имени, и каждый приезжает своим манифестом. Инстанс в `dependencies` втянул
 * бы ядро в граф объектной формой — то есть заставил бы приложение сканировать
 * его `dist` вместо того, чтобы прочитать готовый манифест (C-4).
 *
 * База раскладки здесь не нужна вовсе: у манифестной формы она равна директории
 * манифеста, и считать её от `import.meta.url` больше незачем.
 */
export function createGranularityEditorProvider(): GranumProvider {
  return defineGranumProvider({
    id: GRANULARITY_EDITOR_PROVIDER_ID,
    contractVersion: 1,
    engine: { dialect: GRANULARITY_EDITOR_ENGINE_DIALECT },
    components: Object.values(granularityEditorComponentConfigs),
    dependencies: [GRANULARITY_CORE_PROVIDER_ID],
  })
}
