// Browser-entry провайдера `@feugene/granularity-dashboard`.
//
// Ядро здесь не импортируется: донор объявлен строкой, и приложение подключает
// оба пакета по имени, каждый своим манифестом.
import { createGranularityDashboardProvider } from './shared'

export * from './shared'

export const granularityDashboardProvider = createGranularityDashboardProvider()

export default granularityDashboardProvider
