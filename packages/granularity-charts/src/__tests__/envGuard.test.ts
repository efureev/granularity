import { defineEnvGuardGate } from '@feugene/granularity-test-kit/gates'

/** Дев-гард. `guardValue` — из пакета: подстановка `define` до фабрики не доезжает. */
defineEnvGuardGate({ guardValue: __GR_DEV__ })
