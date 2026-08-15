import { defineGateCoverage } from '@feugene/granularity-test-kit/gates'

/**
 * Пока гейты копировались файлом, забыть один из них стоило ровно ничего:
 * пакет без `styleTokens` жил бы с пиксельными литералами и был бы зелёным.
 */
defineGateCoverage()
