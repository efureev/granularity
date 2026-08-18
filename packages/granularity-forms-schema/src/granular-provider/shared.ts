import type { GranularProvider } from '@feugene/unocss-preset-granular/contract'
import { defineGranularProvider } from '@feugene/unocss-preset-granular/contract'

// <granularity:components:imports> — блок генерируется `yarn generate:registry`
import { grSchemaFormConfig } from '../components/GrSchemaForm/config'
// </granularity:components:imports>

export const GRANULARITY_FORMS_SCHEMA_PROVIDER_ID = '@feugene/granularity-forms-schema'

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

export function createGranularityFormsSchemaProvider(
  granularityProvider: GranularProvider,
  packageBaseUrl: string,
): GranularProvider {
  return defineGranularProvider({
    id: GRANULARITY_FORMS_SCHEMA_PROVIDER_ID,
    contractVersion: 1,
    packageBaseUrl,
    components: Object.values(granularityFormsSchemaComponentConfigs),
    dependencies: [granularityProvider],
  })
}
