import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { collectGranumSubcomponents } from '@feugene/granum/codegen'
import { beforeAll, describe, expect, it } from 'vitest'

import { granularityComponentConfigs } from '../granular-provider/shared'

/**
 * Гейт на рассинхрон реестров компонентов.
 *
 * Точек регистрации три, а не четыре, как было на пресете v1: entry сборки
 * больше не реестр — `granumProvider()` строит их из реестра провайдера (B-4).
 * Поэтому пакет ведёт гейт сам, а не через `defineRegistryGate` из кита:
 * общая фабрика всё ещё требует запись компонента в `vite.config.ts`.
 *
 * Пропуск любой из оставшихся точек по-прежнему не даёт ошибки сборки — молча
 * ломается что-то одно: tree-shaking, subpath-импорт, авто-импорт или отбор
 * классов приложением.
 */
const pkgDir = resolve(import.meta.dirname, '../..')
const read = (relativePath: string): string => readFileSync(resolve(pkgDir, relativePath), 'utf8')

/** Публичный компонент — директория `Gr*` с `index.ts` и `config.ts`, в том числе внутри группы. */
function componentDirs(): string[] {
  const root = resolve(pkgDir, 'src/components')
  const out: string[] = []
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory())
      continue
    if (entry.name.startsWith('Gr')) {
      out.push(entry.name)
      continue
    }
    for (const nested of readdirSync(resolve(root, entry.name), { withFileTypes: true })) {
      if (nested.isDirectory() && nested.name.startsWith('Gr'))
        out.push(`${entry.name}/${nested.name}`)
    }
  }
  return out.filter(dir => (
    existsSync(resolve(root, dir, 'index.ts')) && existsSync(resolve(root, dir, 'config.ts'))
  ))
}

const componentPaths = componentDirs()
const pathOf = new Map(componentPaths.map(dir => [dir.slice(dir.lastIndexOf('/') + 1), dir]))
const publicComponents = [...pathOf.keys()].sort()
const exportsOf = (): Record<string, unknown> => (JSON.parse(read('package.json')) as { exports: Record<string, unknown> }).exports

describe('реестры компонентов', () => {
  /** Части составных компонентов: своей entry у них нет, а subpath обязан быть. */
  let subcomponents: Record<string, string> = {}

  beforeAll(async () => {
    subcomponents = await collectGranumSubcomponents({
      componentsDir: resolve(pkgDir, 'src/components'),
      components: publicComponents,
    })
  })

  it('все списки совпадают с `src/components/`', () => {
    expect(() => {
      execFileSync('node', ['scripts/generate-registry.mjs', '--check'], { cwd: pkgDir, stdio: 'pipe' })
    }).not.toThrow()
  })

  it('в реестре провайдера ровно публичные компоненты', () => {
    expect(Object.keys(granularityComponentConfigs).sort()).toEqual(publicComponents)
  })

  it('каждый публичный компонент экспортирован из root-barrel', () => {
    const barrel = read('src/index.ts')

    for (const component of publicComponents)
      expect(barrel, component).toContain(`export * from './components/${pathOf.get(component)}'`)
  })

  it('каждый публичный компонент имеет subpath-экспорт', () => {
    const exports = exportsOf()

    for (const component of publicComponents)
      expect(exports[`./components/${component}`], `${component} в package.json#exports`).toBeDefined()
  })

  it('манифест провайдера экспортирован: по нему приложение находит пакет', () => {
    // Без этого ключа `granumProvider()` роняет сборку `PackageExportsError`,
    // а приложение не нашло бы манифест через `exports` (M-6, INV-LAY-2).
    expect(exportsOf()['./granum.manifest.json']).toBe('./dist/granum.manifest.json')
  })

  it('в реестрах нет компонентов, которых нет на диске', () => {
    const declared = Object.keys(exportsOf())
      .filter(key => key.startsWith('./components/'))
      .map(key => key.slice('./components/'.length))

    expect(declared.sort()).toEqual([...publicComponents, ...Object.keys(subcomponents)].sort())
  })

  it('у каждой части составного компонента есть subpath на модуль родителя', () => {
    const exports = exportsOf()

    for (const [name, owner] of Object.entries(subcomponents)) {
      expect(exports[`./components/${name}`], `${name} в package.json#exports`).toBeDefined()
      // Алиас, а не копия: модуль у части и родителя один и тот же.
      expect(exports[`./components/${name}`], `${name} ведёт не к ${owner}`).toEqual(exports[`./components/${owner}`])
    }
  })

  it('entry компонентов не ведут руками: их строит плагин из реестра провайдера', () => {
    // Сгенерированного блока entry в конфиге больше нет — если он вернётся,
    // значит вернулась и четвёртая точка синхронизации.
    const viteConfig = read('vite.config.ts')

    expect(viteConfig).not.toContain('granularity:components>')
    expect(viteConfig).toContain('granumProvider({')
    expect(viteConfig).toContain('provider: granularityProvider')
    // Движок сборки задаётся явно: без него granum не знает, чьим словарём
    // отфильтрован список классов манифеста, и отказывается собирать пакет.
    expect(viteConfig).toContain('engine: windEngine()')
  })
})

// `process` используется только для диагностики падения генератора.
void process
