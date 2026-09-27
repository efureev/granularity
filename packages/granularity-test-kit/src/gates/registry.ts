import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

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

    /**
     * granum подгружается лениво и только здесь.
     *
     * Статический импорт делал бы его обязательным для **любого** гейта кита:
     * `@feugene/granularity-test-kit/gates` падал бы на резолюции ещё до того,
     * как потребитель решит, какую фабрику звать, — при том что остальные
     * восьмеро granum не требуют, а `peerDependenciesMeta` объявляет его
     * необязательным.
     */
    beforeAll(async () => {
      const codegen = await import('@feugene/granum/codegen').catch(() => null)

      if (!codegen) {
        throw new Error(
          'Гейту реестров нужен `@feugene/granum` (>=0.2.0): по нему он '
          + 'узнаёт части составных компонентов. Установите пакет или уберите вызов '
          + '`defineRegistryGate`.',
        )
      }

      // Список компонентов сужает обход: без него карта зацепила бы `.vue`
      // из директорий, компонентами не являющихся.
      subcomponents = await codegen.collectGranumSubcomponents({
        componentsDir: resolve(pkgDir, 'src/components'),
        prefix: options.prefix,
        components: publicComponents,
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

    it('каждый публичный компонент имеет subpath-экспорт', () => {
      const pkg = JSON.parse(read('package.json')) as { exports: Record<string, unknown> }

      for (const component of publicComponents)
        expect(pkg.exports[`./components/${component}`], `${component} в package.json#exports`).toBeDefined()
    })

    it('entry компонентов не ведут руками: их строит granumProvider из реестра', () => {
      // Четвёртая точка синхронизации исчезла вместе с пресетом v1: entry
      // `components/<Name>/index` больше не перечисляют в конфиге сборки, их
      // строит плагин из того же реестра провайдера (B-4). Если
      // сгенерированный блок вернётся, вернётся и рассинхрон.
      const viteConfig = read('vite.config.ts')

      expect(viteConfig).not.toContain('granularity:components>')
      expect(viteConfig).toContain('granumProvider({')
      expect(viteConfig).toContain('engine: windEngine()')
      for (const component of publicComponents)
        expect(viteConfig, `${component} перечислен руками`).not.toContain(`'components/${pathOf.get(component) ?? component}/index'`)
    })

    it('манифест пакета экспортирован: без него приложение его не найдёт', () => {
      const pkg = JSON.parse(read('package.json')) as { exports: Record<string, unknown> }

      // `exports['./granum.manifest.json']` — единственный способ, которым
      // приложение добирается до манифеста, не вычисляя путей внутрь пакета
      // (M-6, INV-LAY-2). Без него сборка провайдера падает `PackageExportsError`.
      expect(pkg.exports['./granum.manifest.json']).toBe('./dist/granum.manifest.json')
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

    it('часть составного компонента не попадает в реестр провайдера', () => {
      // Код части и так лежит в чанке родителя. Попади она в реестр — плагин
      // построил бы ей свою entry и продублировал бы модуль.
      for (const name of Object.keys(subcomponents))
        expect(Object.keys(options.componentConfigs), name).not.toContain(name)
    })
  })
}
