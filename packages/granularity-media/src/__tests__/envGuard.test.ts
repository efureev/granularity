import { defineEnvGuardGate } from '@feugene/granularity-test-kit/gates'

/**
 * Дев-гард: предупреждение о непригодном для чтения холсте обязано исчезать
 * из продакшн-сборки вместе с текстом, а не оставаться в бандле потребителя.
 */
defineEnvGuardGate()
