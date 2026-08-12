import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

import { describe, expect, it } from 'vitest'

import { GRANULARITY_CHRONO_COMPONENTS } from '../componentNames'
import { granularityChronoComponentConfigs } from '../granular-provider/shared'

/**
 * Гейт на рассинхрон реестров.
 *
 * Пропуск любой из точек регистрации не даёт ошибки сборки: молча ломается
 * что-то одно — tree-shaking, subpath-импорт, авто-импорт или скан
 * UnoCSS-классов. У предшественника (`granularity-datepicker`) шесть таких
 * списков держались только дисциплиной, и проверить их было нечем.
 *
 * Здесь два слоя. Первый — прогон самого генератора с `--check`: он сверяет
 * все пять реестров с файловой системой и падает кодом возврата. Второй —
 * проверки того, что читается из собранных модулей: генератор мог бы
 * записать синтаксически верный, но бессмысленный список.
 */

// В jsdom `import.meta.url` не file-scheme — пути от cwd пакета.
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

describe('реестры компонентов', () => {
  it('все списки совпадают с `src/components/`', () => {
    expect(() => {
      execFileSync('node', ['scripts/generate-registry.mjs', '--check'], {
        cwd: pkgDir,
        stdio: 'pipe',
      })
    }).not.toThrow()
  })

  it('в реестре провайдера ровно публичные компоненты', () => {
    expect(Object.keys(granularityChronoComponentConfigs).sort()).toEqual([...publicComponents].sort())
  })

  it('список имён совпадает с реестром провайдера', () => {
    // Два списка, потому что их читают из разных мест: реестр — рантайм
    // провайдера, имена — резолвер авто-импорта и конфиг сборки. Разойтись
    // они не имеют права.
    expect([...GRANULARITY_CHRONO_COMPONENTS].sort()).toEqual([...publicComponents].sort())
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

  it('в реестрах нет компонентов, которых нет на диске', () => {
    // Обратный случай: компонент удалили, а записи остались. Сборка при этом
    // падает на несуществующем entry — но только сборка, и только в CI.
    const pkg = JSON.parse(read('package.json')) as { exports: Record<string, unknown> }
    const declared = Object.keys(pkg.exports)
      .filter(key => key.startsWith('./components/'))
      .map(key => key.slice('./components/'.length))

    expect(declared.sort()).toEqual([...publicComponents].sort())
  })
})
