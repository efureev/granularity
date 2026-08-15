import { defineRegistryGate } from '@feugene/granularity-test-kit/gates'

import { GRANULARITY_CHARTS_COMPONENTS } from '../componentNames'
import { granularityChartsComponentConfigs } from '../granular-provider/shared'

/**
 * Пропуск любой из точек регистрации не даёт ошибки сборки: молча ломается
 * что-то одно — tree-shaking, subpath-импорт, авто-импорт или скан
 * UnoCSS-классов.
 */
defineRegistryGate({
  componentConfigs: granularityChartsComponentConfigs,
  componentNames: GRANULARITY_CHARTS_COMPONENTS,
})
