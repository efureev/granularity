import { defineEnvGuardGate } from '@feugene/granularity-test-kit/gates'

/**
 * Дев-предупреждения пакета (о ненайденном CodeMirror, о незагруженной
 * грамматике Shiki) обязаны стоять под `__GR_DEV__` — иначе они кричат в
 * проде у потребителя. Ровно так четыре `console.warn` жили в ядре и графиках.
 */
defineEnvGuardGate({ guardValue: true })
