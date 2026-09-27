// Browser-entry провайдера `@feugene/granularity-forms-schema`.
//
// Ядро здесь не импортируется: донор объявлен строкой, и приложение подключает
// оба пакета по имени, каждый своим манифестом.
import { createGranularityFormsSchemaProvider } from './shared'

export * from './shared'

export const granularityFormsSchemaProvider = createGranularityFormsSchemaProvider()

export default granularityFormsSchemaProvider
