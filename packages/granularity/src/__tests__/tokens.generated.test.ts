import { execFileSync } from 'node:child_process'

import { describe, expect, it } from 'vitest'

// В jsdom `import.meta.url` не file-scheme, поэтому пути — от cwd пакета,
// как в `cssContrast.ts`.
const pkgDir = process.cwd()

/**
 * Гейт против ручной правки сгенерированного реестра.
 *
 * Реестр покомпонентных токенов собирается из `tokens.json` компонентов;
 * единственный способ узнать, что кто-то поправил результат напрямую (или
 * поменял источник и забыл перегенерировать), — прогнать генератор и сравнить.
 */
describe('токены как данные', () => {
  it('реестр покомпонентных токенов совпадает с `tokens.json` компонентов', () => {
    expect(() => {
      execFileSync('node', ['scripts/generate-tokens.mjs', '--check'], { cwd: pkgDir, stdio: 'pipe' })
    }).not.toThrow()
  })
})
