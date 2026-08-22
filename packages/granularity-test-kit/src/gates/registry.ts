import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

import { collectGranularSubcomponents } from '@feugene/unocss-preset-granular/codegen'
import { beforeAll, describe, expect, it } from 'vitest'

import { componentDirs } from '../sources'

export interface RegistryGateOptions {
  /** Корень пакета; по умолчанию — cwd, из которого запущен vitest. */
  pkgDir?: string
  /**
   * Префикс имени компонента. По умолчанию `Gr` — обратная совместимость с
   * ядром; companion-пакету со своей приставкой этого хватает, чтобы фабрика
   * увидела его компоненты вместо нуля.
   */
  prefix?: string
  /** Реестр провайдера: имя компонента → его конфиг. */
  componentConfigs: Record<string, unknown>
  /**
   * Список имён компонентов, если пакет держит его отдельно
   * (`componentNames.ts` — его читают резолвер авто-импорта и конфиг сборки).
   */
  componentNames?: readonly string[]
  /**
   * Скрипт генератора реестров; `--check` обязан падать кодом возврата.
   * `null` — у пакета генератора нет.
   */
  generatorScript?: string | null
  /** В `exports` нет компонентов, которых нет на диске. */
  requireExactExports?: boolean
}

/**
 * Части составных компонентов (`GrTimelineItem`, `GrListItem`, пункты меню).
 *
 * Публичным компонентом такая часть не считается — своих `index.ts` и
 * `config.ts` у неё нет, — но subpath ей нужен: без него гранулярный импорт
 * упирается в `ERR_PACKAGE_PATH_NOT_EXPORTED`, то есть идея пакета на эти имена
 * не распространяется. Карту гейт собирает сам, тем же кодом, что и генератор:
 * приняв её параметром, он подтверждал бы ровно то, что записал генератор.
 */
type Subcomponents = Record<string, string>

/**
 * Гейт на рассинхрон реестров.
 *
 * Пропуск любой из точек регистрации не даёт ошибки сборки: молча ломается
 * что-то одно — tree-shaking, subpath-импорт, авто-импорт или скан
 * UnoCSS-классов. У предшественника (`granularity-datepicker`) шесть таких
 * списков держались только дисциплиной, и проверить их было нечем.
 *
 * Слоя два. Первый — прогон самого генератора с `--check`: он сверяет все
 * реестры с файловой системой. Второй — проверки того, что читается из
 * собранных модулей: генератор мог бы записать синтаксически верный, но
 * бессмысленный список.
 */
export function defineRegistryGate(options: RegistryGateOptions): void {
  const pkgDir = options.pkgDir ?? process.cwd()
  const generatorScript = options.generatorScript === undefined ? 'scripts/generate-registry.mjs' : options.generatorScript

  const read = (relativePath: string): string => readFileSync(resolve(pkgDir, relativePath), 'utf8')

  /**
   * Публичный компонент = директория `<prefix>*` c `index.ts` и `config.ts`,
   * в том числе внутри группы. Обход тот же, что у генератора реестров: иначе
   * гейт объявил бы лишними ровно те компоненты, которые генератор только что
   * записал.
   */
  const componentPaths = componentDirs(resolve(pkgDir, 'src/components'), options.prefix)

  const publicComponents = componentPaths
    .filter(dir => (
      existsSync(resolve(pkgDir, 'src/components', dir, 'index.ts'))
      && existsSync(resolve(pkgDir, 'src/components', dir, 'config.ts'))
    ))
    .map(dir => dir.slice(dir.lastIndexOf('/') + 1))
    .sort()

  /** Путь компонента по его имени — для проверок, которым нужен адрес в дереве. */
  const pathOf = new Map(componentPaths.map(dir => [dir.slice(dir.lastIndexOf('/') + 1), dir]))

  describe('реестры компонентов', () => {
    let subcomponents: Subcomponents = {}

    beforeAll(async () => {
      subcomponents = await collectGranularSubcomponents({
        componentsDir: resolve(pkgDir, 'src/components'),
      })
    })

    it.runIf(generatorScript !== null)('все списки совпадают с `src/components/`', () => {
      expect(() => {
        execFileSync('node', [generatorScript!, '--check'], { cwd: pkgDir, stdio: 'pipe' })
      }).not.toThrow()
    })

    it('в реестре провайдера ровно публичные компоненты', () => {
      expect(Object.keys(options.componentConfigs).sort()).toEqual(publicComponents)
    })

    it.runIf(options.componentNames !== undefined)('список имён совпадает с реестром провайдера', () => {
      // Два списка, потому что их читают из разных мест: реестр — рантайм
      // провайдера, имена — резолвер авто-импорта и конфиг сборки. Разойтись
      // они не имеют права.
      expect([...options.componentNames!].sort()).toEqual(publicComponents)
    })

    it('каждый публичный компонент экспортирован из root-barrel', () => {
      const barrel = read('src/index.ts')

      for (const component of publicComponents)
        expect(barrel, component).toContain(`export * from './components/${pathOf.get(component) ?? component}'`)
    })

    it('каждый публичный компонент имеет subpath-экспорт и vite-entry', () => {
      const pkg = JSON.parse(read('package.json')) as { exports: Record<string, unknown> }
      const viteConfig = read('vite.config.ts')

      for (const component of publicComponents) {
        expect(pkg.exports[`./components/${component}`], `${component} в package.json#exports`).toBeDefined()
        expect(viteConfig, `${component} в vite.config.ts`).toContain(`'components/${pathOf.get(component) ?? component}/index'`)
      }
    })

    it.runIf(options.requireExactExports ?? true)('в реестрах нет компонентов, которых нет на диске', () => {
      // Обратный случай: компонент удалили, а записи остались. Сборка при этом
      // падает на несуществующем entry — но только сборка, и только в CI.
      const pkg = JSON.parse(read('package.json')) as { exports: Record<string, unknown> }
      const declared = Object.keys(pkg.exports)
        .filter(key => key.startsWith('./components/'))
        .map(key => key.slice('./components/'.length))

      expect(declared.sort()).toEqual([...publicComponents, ...Object.keys(subcomponents)].sort())
    })

    it('у каждой части составного компонента есть subpath на модуль родителя', () => {
      const pkg = JSON.parse(read('package.json')) as {
        exports: Record<string, { import?: string } | string>
      }

      for (const [name, owner] of Object.entries(subcomponents)) {
        const entry = pkg.exports[`./components/${name}`]
        const parent = pkg.exports[`./components/${owner}`]

        expect(entry, `${name} в package.json#exports`).toBeDefined()
        // Алиас, а не копия: модуль у части и родителя один и тот же.
        expect(entry, `${name} ведёт не к ${owner}`).toEqual(parent)
      }
    })

    it('часть составного компонента не заводит своей entry', () => {
      // Код части и так лежит в чанке родителя — вторая entry дублировала бы его.
      const viteConfig = read('vite.config.ts')

      for (const name of Object.keys(subcomponents))
        expect(viteConfig, name).not.toContain(`'components/${name}/index'`)
    })
  })
}
