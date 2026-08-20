import { defineEnvGuardGate } from '@feugene/granularity-test-kit/gates'

/**
 * Дев-гард: предупреждение пакета обязано стоять под `__GR_DEV__`, иначе оно
 * кричит в проде у потребителя. У пакета такое предупреждение есть —
 * `useDataSource` без источника данных, — поэтому гейт здесь не про запас.
 */
defineEnvGuardGate()
