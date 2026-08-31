import { defineRegistryGate } from '@feugene/granularity-test-kit/gates'

import { GRANULARITY_CODE_COMPONENTS } from '../componentNames'
import { granularityCodeComponentConfigs } from '../granular-provider/shared'

/**
 * Пропуск любой из пяти точек регистрации не даёт ошибки сборки: молча ломается
 * что-то одно — tree-shaking, subpath-импорт, авто-импорт или скан классов.
 */
defineRegistryGate({
  componentConfigs: granularityCodeComponentConfigs,
  componentNames: GRANULARITY_CODE_COMPONENTS,
})
