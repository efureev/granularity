// Browser-entry провайдера `@feugene/granularity-code`.
//
// Ядро здесь не импортируется: донор объявлен строкой, и приложение подключает
// оба пакета по имени, каждый своим манифестом.
import { createGranularityCodeProvider } from './shared'

export * from './shared'

export const granularityCodeProvider = createGranularityCodeProvider()

export default granularityCodeProvider
