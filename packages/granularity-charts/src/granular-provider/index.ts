// Browser-entry провайдера `@feugene/granularity-charts`.
//
// Ядро здесь не импортируется: донор объявлен строкой, и приложение подключает
// оба пакета по имени, каждый своим манифестом.
import { createGranularityChartsProvider } from './shared'

// Реэкспортом, как в ядре: реестр компонентов — публичная информация о пакете,
// и по нему строятся списки на стороне потребителя (например цели e2e витрины).
export * from './shared'

export const granularityChartsProvider = createGranularityChartsProvider()

export default granularityChartsProvider
