import type { ComponentResolver, ComponentResolverObject } from 'unplugin-vue-components/types'

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
   * - `true` / `'css'` — пакет публикует покомпонентные style-бандлы (как ядро).
   * - `false` — пакет инлайнит CSS в JS-чанк (например через `libInjectCss`);
   *   тогда стиль подтянется вместе с JS-импортом и отдельный side-effect не нужен.
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
 * // Companion-пакет с whitelist (без CSS side-effect — CSS инлайнится):
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
 * Опции фабрики {@link GranularityResolver} (core-preset пакета
 * `@feugene/granularity`).
 */
export interface GranularityResolverOptions {
  /**
   * Префикс имён компонентов в шаблонах.
   *
   * По умолчанию `'Gr'` — совпадает с соглашением пакета `@feugene/granularity`.
   * Можно переопределить, если в приложении есть коллизии с другими библиотеками.
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
   * **Ядру это не нужно, и по умолчанию выключено.** Свой CSS компонент тянет
   * сам: `libInjectCss` вписывает `import '../styles.css'` внутрь его чанка, а
   * у большинства компонентов собственного CSS нет вовсе — их оформление
   * собирает UnoCSS-пресет. Subpath на такой файл ядро не публикует, поэтому
   * включённая опция давала `ERR_PACKAGE_PATH_NOT_EXPORTED` на сборке
   * потребителя — на каждом компоненте, а не только на редком.
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
  readonly prefix: string
  readonly importStyle: boolean
  readonly directives: boolean
  readonly exclude: RegExp | undefined
}

/** @internal */
function normalizeOptions(options: GranularityResolverOptions): ResolvedOptions {
  return {
    prefix: options.prefix ?? GRANULARITY_DEFAULT_PREFIX,
    importStyle: options.importStyle === true || options.importStyle === 'css',
    directives: options.directives !== false,
    exclude: options.exclude,
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
 * Резолвит компоненты и директивы `@feugene/granularity` на **гранулярные
 * sub-path**-экспорты пакета, а не на общий корневой `index`. За счёт этого
 * tree-shaking в приложении потребителя работает максимально плотно: в бандл
 * попадает ровно то, что встретилось в шаблонах.
 *
 * Для companion-пакетов (например `@feugene/granularity-chrono`) используйте
 * их собственный резолвер, построенный на {@link createGranularResolver}, и
 * ставьте его **перед** этим (жадным по `Gr*`) резолвером — иначе core-резолвер
 * перехватит одноимённые компоненты companion-пакета.
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

  const resolvers: ComponentResolver[] = [
    createGranularResolver({
      packageName: GRANULARITY_PACKAGE_NAME,
      prefix: resolved.prefix,
      importStyle: resolved.importStyle,
      exclude: resolved.exclude,
    }),
  ]

  if (resolved.directives)
    resolvers.push(buildDirectiveResolver(resolved))

  return resolvers
}
