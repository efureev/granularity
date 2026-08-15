import { defineRegistryGate } from '@feugene/granularity-test-kit/gates'

import { GRANULARITY_CHRONO_COMPONENTS } from '../componentNames'
import { granularityChronoComponentConfigs } from '../granular-provider/shared'

/**
 * Пропуск любой из точек регистрации не даёт ошибки сборки: молча ломается
 * что-то одно — tree-shaking, subpath-импорт, авто-импорт или скан
 * UnoCSS-классов. У предшественника (`granularity-datepicker`) шесть таких
 * списков держались только дисциплиной, и проверить их было нечем.
 */
defineRegistryGate({
  componentConfigs: granularityChronoComponentConfigs,
  componentNames: GRANULARITY_CHRONO_COMPONENTS,
})
