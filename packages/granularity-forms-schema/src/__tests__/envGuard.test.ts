import { defineEnvGuardGate } from '@feugene/granularity-test-kit/gates'

/**
 * Дев-гард. Своих предупреждений у пакета пока нет, поэтому `__GR_DEV__` в нём
 * не объявлен и `guardValue` не передаётся — гейт стоит здесь на будущее:
 * первое же `console.warn` без гарда покраснеет.
 */
defineEnvGuardGate()
