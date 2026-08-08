import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * Гейт гранулярности публичных composables.
 *
 * Контракт пакета — subpath на каждую единицу, но блоки composables в
 * `package.json#exports` и `vite.config.ts` (в отличие от компонентных)
 * ведутся руками, и новый композабл легко забыть: `useAnnouncer` и
 * `useVirtualList` жили только в root-barrel, а `useGrFormControl` — контракт
 * форм-контрола из правил репозитория — не был экспортирован вообще ниоткуда.
 *
 * Правило: каждый файл `src/composables/*.ts` (внутренние живут в `internal/`)
 * обязан присутствовать во всех трёх реестрах — exports, vite-entry, barrel.
 */

const packageDir = process.cwd()

const publicComposables = readdirSync(resolve(packageDir, 'src/composables'), { withFileTypes: true })
  .filter(entry => entry.isFile() && entry.name.endsWith('.ts'))
  .map(entry => entry.name.replace(/\.ts$/, ''))

const packageJson = JSON.parse(readFileSync(resolve(packageDir, 'package.json'), 'utf8')) as {
  exports: Record<string, unknown>
}
const viteConfig = readFileSync(resolve(packageDir, 'vite.config.ts'), 'utf8')
const rootBarrel = readFileSync(resolve(packageDir, 'src/index.ts'), 'utf8')

describe('гранулярность composables', () => {
  it('нашёл сами композаблы', () => {
    expect(publicComposables.length).toBeGreaterThan(0)
  })

  it('каждый публичный композабл имеет subpath в package.json#exports', () => {
    const missing = publicComposables.filter(name => !(`./composables/${name}` in packageJson.exports))
    expect(missing, missing.join(', ')).toEqual([])
  })

  it('каждый публичный композабл имеет entry в vite.config.ts', () => {
    const missing = publicComposables.filter(name => !viteConfig.includes(`'composables/${name}'`))
    expect(missing, missing.join(', ')).toEqual([])
  })

  it('каждый публичный композабл реэкспортирован из root-barrel', () => {
    const missing = publicComposables.filter(name => !rootBarrel.includes(`from './composables/${name}'`))
    expect(missing, missing.join(', ')).toEqual([])
  })
})
