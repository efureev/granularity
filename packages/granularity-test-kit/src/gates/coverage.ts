import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

import { describe, expect, it } from 'vitest'

import { stripComments } from '../sources'

/** Фабрики, без которых пакет дизайн-системы считается непокрытым. */
export const REQUIRED_GATES = [
  'defineRegistryGate',
  'defineComponentTokensGate',
  'defineStyleTokensGate',
  'defineComponentDefaultsGate',
  'defineComponentDocsGate',
] as const

export interface GateCoverageOptions {
  /** Директория с гейтами пакета; по умолчанию — `<cwd>/src/__tests__`. */
  testsDir?: string
  /** Что обязано быть подключено. */
  required?: readonly string[]
}

/**
 * Гейт полноты набора: пакет подключил все обязательные фабрики.
 *
 * Пока гейты копировались файлом, забыть один из них стоило ровно ничего —
 * пакет без `styleTokens` жил с пиксельными литералами и был зелёным. Проверка
 * идёт по тексту тестов, а не по вызовам в рантайме: vitest изолирует файлы
 * друг от друга, и счётчик, который фабрика вела бы в модуле, увидел бы только
 * собственный файл.
 */
export function defineGateCoverage(options: GateCoverageOptions = {}): void {
  const testsDir = options.testsDir ?? resolve(process.cwd(), 'src/__tests__')
  const required = options.required ?? REQUIRED_GATES

  const sources = readdirSync(testsDir, { withFileTypes: true, recursive: true })
    .filter(entry => entry.isFile() && entry.name.endsWith('.ts'))
    .map(entry => stripComments(readFileSync(resolve(entry.parentPath, entry.name), 'utf8')))

  describe('полнота набора гейтов', () => {
    it.each(required.map(gate => [gate] as const))('%s подключён', (gate) => {
      expect(
        sources.some(source => source.includes(`${gate}(`)),
        `гейт не подключён: добавь вызов \`${gate}\` в \`src/__tests__/\``,
      ).toBe(true)
    })
  })
}
