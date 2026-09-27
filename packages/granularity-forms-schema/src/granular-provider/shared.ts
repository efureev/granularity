import type { GranumProvider } from '@feugene/granum/contract'
import { defineGranumProvider } from '@feugene/granum/contract'

// <granularity:components:imports> — блок генерируется `yarn generate:registry`
import { grSchemaFormConfig } from '../components/GrSchemaForm/config'
// </granularity:components:imports>

export const GRANULARITY_FORMS_SCHEMA_PROVIDER_ID = '@feugene/granularity-forms-schema'

/** Донор: компоненты пакета опираются на компоненты ядра. */
const GRANULARITY_CORE_PROVIDER_ID = '@feugene/granularity'

/**
 * Словарь утилит, против которого написаны классы компонентов, — тот же, что у
 * ядра. Сборка сверит объявление с диалектом движка, которым её запустили, и не
 * даст записать в манифест чужой словарь.
 */
export const GRANULARITY_FORMS_SCHEMA_ENGINE_DIALECT = 'unocss/preset-wind3+granum@66'

/**
 * Реестр компонентов пакета.
 *
 * Именованная мапа, а не массив: её читают гейт реестров и e2e витрины, и по
 * имени они сверяют состав с файловой системой.
 */
export const granularityFormsSchemaComponentConfigs = {
  // <granularity:components:registry> — блок генерируется `yarn generate:registry`
  GrSchemaForm: grSchemaFormConfig,
  // </granularity:components:registry>
}

/**
 * Собирает провайдера пакета.
 *
 * Донор объявлен строкой, а не инстансом: приложение подключает оба пакета по
 * имени, и каждый приезжает своим манифестом. Инстанс в `dependencies` втянул
 * бы ядро в граф объектной формой — то есть заставил бы приложение сканировать
 * его `dist` вместо того, чтобы прочитать готовый манифест (C-4).
 *
 * `@feugene/granularity-chrono` донором не объявлен намеренно: пикеры даты
 * приходят отдельным subpath `./renderers/chrono`, их компоненты добавляет в
 * селекцию потребитель. Донор обязал бы к присутствию chrono всех, включая
 * формы без единого поля даты.
 *
 * База раскладки здесь не нужна вовсе: у манифестной формы она равна директории
 * манифеста, и считать её от `import.meta.url` больше незачем.
 */
export function createGranularityFormsSchemaProvider(): GranumProvider {
  return defineGranumProvider({
    id: GRANULARITY_FORMS_SCHEMA_PROVIDER_ID,
    contractVersion: 1,
    engine: { dialect: GRANULARITY_FORMS_SCHEMA_ENGINE_DIALECT },
    components: Object.values(granularityFormsSchemaComponentConfigs),
    dependencies: [GRANULARITY_CORE_PROVIDER_ID],
  })
}
