import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { granularityComponentConfigs } from '../granular-provider/shared'

// В jsdom `import.meta.url` не file-scheme — пути от cwd пакета, как в `cssContrast.ts`.
const pkgDir = process.cwd()

function read(relativePath: string): string {
  return readFileSync(resolve(pkgDir, relativePath), 'utf8')
}

/** Публичный компонент = директория `Gr*` c `index.ts` и `config.ts`. */
const publicComponents = readdirSync(resolve(pkgDir, 'src/components'), { withFileTypes: true })
  .filter(entry => entry.isDirectory() && entry.name.startsWith('Gr'))
  .map(entry => entry.name)
  .filter(name => (
    existsSync(resolve(pkgDir, 'src/components', name, 'index.ts'))
    && existsSync(resolve(pkgDir, 'src/components', name, 'config.ts'))
  ))

/**
 * Гейт на рассинхрон четырёх реестров.
 *
 * Пропуск любой из точек регистрации не даёт ошибки сборки: молча ломается
 * что-то одно — tree-shaking, subpath-импорт, скан UnoCSS-классов или
 * генерация API-доки витрины. Раньше это ловилось только глазами.
 */
describe('реестры компонентов', () => {
  it('четыре списка совпадают с `src/components/`', () => {
    expect(() => {
      execFileSync('node', ['scripts/generate-registry.mjs', '--check'], {
        cwd: pkgDir,
        stdio: 'pipe',
      })
    }).not.toThrow()
  })

  it('в реестре провайдера ровно публичные компоненты', () => {
    expect(Object.keys(granularityComponentConfigs).sort()).toEqual([...publicComponents].sort())
  })

  it('каждый публичный компонент экспортирован из root-barrel', () => {
    const barrel = read('src/index.ts')

    for (const component of publicComponents)
      expect(barrel, component).toContain(`export * from './components/${component}'`)
  })

  it('каждый публичный компонент имеет subpath-экспорт и vite-entry', () => {
    const pkg = JSON.parse(read('package.json')) as { exports: Record<string, unknown> }
    const viteConfig = read('vite.config.ts')

    for (const component of publicComponents) {
      expect(pkg.exports[`./components/${component}`], `${component} в package.json#exports`).toBeDefined()
      expect(viteConfig, `${component} в vite.config.ts`).toContain(`'components/${component}/index'`)
    }
  })
})
