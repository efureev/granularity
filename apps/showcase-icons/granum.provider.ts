import { defineGranumProvider } from '@feugene/granum/contract'
import { WIND_DIALECT_EXTRA } from '@feugene/granum-engine-wind'

import { rules as lucideIconRules } from './src/engine'

/**
 * Провайдер без компонентов: он везёт только правила движка.
 *
 * Диалект объявлен тот же, что у пакетов дизайн-системы, — правила загружаются
 * приложением лишь при совпадении диалектов (E-9), иначе granum их пропустит и
 * скажет об этом кодом `engine-rules-skipped`.
 */
export const showcaseIconsProvider = defineGranumProvider({
  id: '@feugene/granularity-showcase-icons',
  contractVersion: 1,
  components: [],
  engine: { dialect: WIND_DIALECT_EXTRA, rules: lucideIconRules },
})
