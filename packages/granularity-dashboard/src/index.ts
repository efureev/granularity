// <granularity:components> — блок генерируется `yarn generate:registry`
export * from './components/GrDashboard'
export * from './components/GrDashboardItem'
export * from './components/GrDashboardItemSettings'
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

export type {
  GrDashboardTransfer,
  GrDashboardTransferPoint,
  GrDashboardTransferTarget,
  UseDashboardTransferReturn,
} from './composables/useDashboardTransfer'
export { GR_DASHBOARD_TRANSFER_THRESHOLD, useDashboardTransfer } from './composables/useDashboardTransfer'

export { type GrDashboardLocale, grDashboardMessages } from './i18n'
