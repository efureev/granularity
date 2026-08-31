import { defineGateCoverage } from '@feugene/granularity-test-kit/gates'

/**
 * Пакет, забывший гейт, краснеет вместо того, чтобы молча жить без него.
 * Пока гейты копировались файлом, забыть один стоило ровно ничего.
 */
defineGateCoverage()
