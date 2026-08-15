import { defineRegistryGate } from '@feugene/granularity-test-kit/gates'

import { granularityComponentConfigs } from '../granular-provider/shared'

/**
 * Гейт на рассинхрон четырёх реестров.
 *
 * Пропуск любой из точек регистрации не даёт ошибки сборки: молча ломается
 * что-то одно — tree-shaking, subpath-импорт, скан UnoCSS-классов или
 * генерация API-доки витрины. Раньше это ловилось только глазами.
 */
defineRegistryGate({
  componentConfigs: granularityComponentConfigs,
})
