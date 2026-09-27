// Browser-entry провайдера `@feugene/granularity-chrono`.
//
// Ядро здесь не импортируется: донор объявлен строкой, и приложение подключает
// оба пакета по имени, каждый своим манифестом.
import { createGranularityChronoProvider } from './shared'

// Реэкспортом, как в ядре: реестр компонентов — публичная информация о пакете,
// и по нему строятся списки на стороне потребителя (например цели e2e витрины).
export * from './shared'

export const granularityChronoProvider = createGranularityChronoProvider()

export default granularityChronoProvider
