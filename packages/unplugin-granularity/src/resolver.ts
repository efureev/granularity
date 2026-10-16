import type { ComponentResolver, ComponentResolverObject } from 'unplugin-vue-components/types'
import process from 'node:process'

import {
  buildComponentIndex,
  discoverGranularityPackages,
  type GranularityComponentIndex,
} from './componentIndex'
import {
  GRANULARITY_DEFAULT_PREFIX,
  GRANULARITY_DIRECTIVES,
  GRANULARITY_PACKAGE_NAME,
} from './manifest'

/**
 * Опции обобщённой фабрики {@link createGranularResolver}.
 *
 * Фабрика умеет строить component-resolver для **любого** гранулярного пакета
 * экосистемы (ядро `@feugene/granularity`, companion-пакеты вроде
 * `@feugene/granularity-chrono`), у которого компоненты опубликованы как
 * subpath-экспорты `<packageName>/components/<Name>` с именованным экспортом.
 */
export interface GranularResolverOptions {
  /** Имя npm-пакета, из которого импортируются компоненты. */
  packageName: string

  /**
   * Жадное сопоставление по префиксу имени в шаблоне (`GrButton`, `GrInput`, …).
   * Взаимоисключающе с {@link components}. Если заданы оба — приоритет у
   * {@link components} (whitelist точнее и не даёт коллизий).
   */
  prefix?: string

  /**
   * Явный whitelist имён компонентов. Используйте его для companion-пакетов,
   * чьи имена пересекаются с жадным `Gr*`-резолвером ядра (например пять
   * компонентов `@feugene/granularity-chrono`), чтобы избежать коллизий.
   */
  components?: readonly string[]

  /**
   * Подтягивать ли CSS компонента как side-effect
   * `<packageName>/components/<Name>/styles.css`.
   *
   * - `true` / `'css'` — пакет раздаёт покомпонентный CSS отдельными файлами и
   *   объявляет их в `exports`.
   * - `false` — отдельный side-effect не нужен: пакеты экосистемы таких subpath
   *   не публикуют, стили компонентов приложению доставляет granum из манифеста
   *   пакета.
   *
   * @default false
   */
  importStyle?: boolean | 'css'

  /**
   * Подкомпоненты: имя в шаблоне → компонент, из subpath которого они приезжают.
   *
   * Нужна провайдеру, который не публикует subpath на части составных
   * компонентов: без неё жадный резолвер строит для них несуществующий путь, и
   * сборка падает у потребителя. Ядро такие subpath публикует с `0.28.2`, и
   * своей карты ему больше не нужно.
   */
  subcomponents?: Readonly<Record<string, string>>

  /** Исключить компоненты по RegExp. */
  exclude?: RegExp
}

/**
 * Обобщённая фабрика component-resolver'а для `unplugin-vue-components`.
 *
 * Резолвит имя компонента из шаблона на гранулярный subpath-экспорт
 * `<packageName>/components/<Name>` — так tree-shaking у потребителя остаётся
 * плотным (в бандл попадает ровно то, что встретилось в шаблонах).
 *
 * @example
 * ```ts
 * // Companion-пакет с whitelist (без CSS side-effect — CSS доставляет granum):
 * createGranularResolver({
 *   packageName: '@feugene/granularity-chrono',
 *   components: ['GrCalendar', 'GrDatePicker', 'GrDateTimePicker', 'GrTimePicker', 'GrDateRangePicker'],
 *   importStyle: false,
 * })
 * ```
 */
export function createGranularResolver(options: GranularResolverOptions): ComponentResolverObject {
  const { packageName, prefix, components, subcomponents, importStyle = false, exclude } = options
  const whitelist = components ? new Set(components) : undefined

  return {
    type: 'component',
    resolve(name) {
      if (exclude?.test(name))
        return

      // Точное сопоставление (whitelist) имеет приоритет над жадным префиксом.
      if (whitelist) {
        if (!whitelist.has(name))
          return
      }
      else if (prefix) {
        if (!name.startsWith(prefix))
          return
      }
      else {
        return
      }

      // Экспорт остаётся своим, модуль — родительский: subpath есть только у него.
      const owner = subcomponents?.[name] ?? name
      const from = `${packageName}/components/${owner}`
      const sideEffects = importStyle
        ? `${packageName}/components/${owner}/styles.css`
        : undefined

      return sideEffects ? { name, from, sideEffects } : { name, from }
    },
  }
}

/**
 * Опции фабрики {@link GranularityResolver}: один резолвер на всю экосистему —
 * ядро и спутники.
 */
export interface GranularityResolverOptions {
  /**
   * Пакеты, чьи компоненты резолвить.
   *
   * По умолчанию — все `@feugene/granularity` и `@feugene/granularity-*` из
   * `dependencies`, `devDependencies` и `peerDependencies` приложения
   * (`<root>/package.json`); не нашлось ни одного — одно ядро.
   */
  packages?: readonly string[]

  /**
   * Корень приложения: отсюда читается его `package.json` и ищутся пакеты.
   *
   * @default process.cwd()
   */
  root?: string

  /**
   * Префикс имён компонентов в шаблонах: имя без него резолвер не смотрит.
   *
   * @default 'Gr'
   */
  prefix?: string

  /**
   * Подтягивать ли CSS компонента как side-effect.
   *
   * - `true` / `'css'` — в `sideEffects` попадёт `<pkg>/components/<Name>/styles.css`;
   * - `false` — ничего не подгружаем.
   *
   * **Пакетам экосистемы это не нужно, и по умолчанию выключено.** Их чанки
   * CSS не импортируют: `styles.css` компонента granum берёт из манифеста пакета
   * в слой `granum.components`. Subpath `components/<Name>/styles.css` пакеты не
   * публикуют, поэтому включённая опция дала бы `ERR_PACKAGE_PATH_NOT_EXPORTED`
   * на сборке потребителя — на каждом компоненте, а не только на редком.
   *
   * Опция остаётся для провайдера, который раздаёт CSS отдельными файлами и
   * объявляет их в `exports`.
   *
   * @default false
   */
  importStyle?: boolean | 'css'

  /**
   * Включать ли авто-импорт директив (`v-hotkey`, `v-click-outside`, …).
   *
   * @default true
   */
  directives?: boolean

  /**
   * Исключить компоненты/директивы по RegExp.
   *
   * Удобно, если в проекте случайно пересекаются имена: `/^GrInternal/` и т.п.
   */
  exclude?: RegExp
}

/** Нормализованная форма опций — все значения разрешены. */
interface ResolvedOptions {
  readonly packages: readonly string[] | undefined
  readonly root: string
  readonly prefix: string
  readonly importStyle: boolean
  readonly directives: boolean
  readonly exclude: RegExp | undefined
}

/** @internal */
function normalizeOptions(options: GranularityResolverOptions): ResolvedOptions {
  return {
    packages: options.packages,
    root: options.root ?? process.cwd(),
    prefix: options.prefix ?? GRANULARITY_DEFAULT_PREFIX,
    importStyle: options.importStyle === true || options.importStyle === 'css',
    directives: options.directives !== false,
    exclude: options.exclude,
  }
}

/**
 * Резолвер компонентов по индексу из `exports`. Индекс строится при первом
 * имени из шаблона, а не при создании резолвера: конфиг Vite исполняется и там,
 * где компонентов никто не резолвит.
 *
 * @internal
 */
function buildComponentResolver(options: ResolvedOptions): ComponentResolverObject {
  const { root, prefix, importStyle, exclude } = options
  let index: GranularityComponentIndex | undefined

  const load = (): GranularityComponentIndex => {
    if (!index) {
      const discovered = options.packages ?? discoverGranularityPackages(root)
      index = buildComponentIndex(discovered.length > 0 ? discovered : [GRANULARITY_PACKAGE_NAME], root)
    }
    return index
  }

  return {
    type: 'component',
    resolve(name) {
      if (exclude?.test(name) || !name.startsWith(prefix))
        return

      const entry = load().components.get(name)
      if (!entry)
        return

      const from = `${entry.packageName}/components/${entry.owner}`
      return importStyle ? { name, from, sideEffects: `${from}/styles.css` } : { name, from }
    },
  }
}

/** @internal */
function buildDirectiveResolver({ exclude }: ResolvedOptions): ComponentResolverObject {
  return {
    type: 'directive',
    resolve(name) {
      if (exclude?.test(name))
        return

      const descriptor = GRANULARITY_DIRECTIVES[name]
      if (!descriptor)
        return

      return {
        name: descriptor.named,
        from: `${GRANULARITY_PACKAGE_NAME}/directives/${descriptor.module}`,
      }
    },
  }
}

/**
 * Фабрика резолвера для [`unplugin-vue-components`](https://github.com/unplugin/unplugin-vue-components).
 *
 * Один резолвер на всю экосистему: компоненты ядра и спутников, части
 * составных компонентов и директивы ядра. Компонент резолвится на
 * **гранулярный sub-path**-экспорт своего пакета, а не на корневой `index`:
 * в бандл попадает ровно то, что встретилось в шаблонах, а granum видит
 * компонент по подпути — корень его guard отвергает.
 *
 * Список компонентов не ведётся руками: резолвер читает `exports` пакетов,
 * которые установило приложение. Имя, которого ни один пакет не экспортирует,
 * и имя, которое экспортируют два пакета, он не резолвит.
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import Components from 'unplugin-vue-components/vite'
 * import { GranularityResolver } from '@feugene/unplugin-granularity'
 *
 * export default defineConfig({
 *   plugins: [
 *     Components({
 *       resolvers: [GranularityResolver()],
 *     }),
 *   ],
 * })
 * ```
 */
export function GranularityResolver(options: GranularityResolverOptions = {}): ComponentResolver[] {
  const resolved = normalizeOptions(options)
  const resolvers: ComponentResolver[] = [buildComponentResolver(resolved)]

  if (resolved.directives)
    resolvers.push(buildDirectiveResolver(resolved))

  return resolvers
}
