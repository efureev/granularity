// <granularity:components> — блок генерируется `yarn generate:registry`
export * from './components/GrDashboard'
export * from './components/GrDashboardItem'
export * from './components/GrDashboardPalette'
export * from './components/GrDashboardToolbar'
// </granularity:components>

export * from './layout'

export type {
  GrDashboardLayoutStorage,
  UseDashboardLayoutOptions,
  UseDashboardLayoutReturn,
} from './composables/useDashboardLayout'
export { localStorageLayoutStorage, useDashboardLayout } from './composables/useDashboardLayout'

export { type GrDashboardLocale, grDashboardMessages } from './i18n'
