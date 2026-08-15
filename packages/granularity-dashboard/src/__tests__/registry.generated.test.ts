import { defineRegistryGate } from '@feugene/granularity-test-kit/gates'

import { GRANULARITY_DASHBOARD_COMPONENTS } from '../componentNames'
import { granularityDashboardComponentConfigs } from '../granular-provider/shared'

/**
 * Пропуск любой из точек регистрации не даёт ошибки сборки: молча ломается
 * что-то одно — tree-shaking, subpath-импорт, авто-импорт или скан
 * UnoCSS-классов.
 */
defineRegistryGate({
  componentConfigs: granularityDashboardComponentConfigs,
  componentNames: GRANULARITY_DASHBOARD_COMPONENTS,
})
