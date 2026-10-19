import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

// В jsdom `import.meta.url` не file-scheme, поэтому пути — от cwd пакета,
// как в `cssContrast.ts`.
const pkgDir = process.cwd()

/**
 * Гейт против ручной правки сгенерированных файлов.
 *
 * Реестр покомпонентных токенов собирается из `tokens.json` компонентов, а CSS
 * темы ядра (`src/styles/tokens.css`, `themes/*.css`) — генератором пакета
 * `@feugene/granularity-tokens` из её данных. Единственный способ узнать, что
 * кто-то поправил результат напрямую (или поменял источник и забыл
 * перегенерировать), — прогнать генератор и сравнить. Без этого расхождение
 * всплывёт только в браузере без `color-mix`, то есть никогда.
 */
describe('токены как данные', () => {
  it('реестр покомпонентных токенов совпадает с `tokens.json` компонентов', () => {
    expect(() => {
      execFileSync('node', ['scripts/generate-tokens.mjs', '--check'], { cwd: pkgDir, stdio: 'pipe' })
    }).not.toThrow()
  })

  it('CSS темы ядра совпадает с данными темы в пакете токенов', () => {
    expect(() => {
      execFileSync('node', ['scripts/generate.mjs', '--check'], { cwd: resolve(pkgDir, '../granularity-tokens'), stdio: 'pipe' })
    }).not.toThrow()
  })
})
