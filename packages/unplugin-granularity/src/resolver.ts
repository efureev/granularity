import type { ComponentResolver, ComponentResolverObject } from 'unplugin-vue-components/types'

import {
  GRANULARITY_DEFAULT_PREFIX,
  GRANULARITY_DIRECTIVES,
  GRANULARITY_PACKAGE_NAME,
} from './manifest'

/**
 * Опции фабрики {@link GranularityResolver}.
 */
export interface GranularityResolverOptions {
  /**
   * Префикс имён компонентов в шаблонах.
   *
   * По умолчанию `'Ds'` — совпадает с соглашением пакета `@feugene/granularity`.
   * Можно переопределить, если в приложении есть коллизии с другими библиотеками.
   *
   * @default 'Ds'
   */
  prefix?: string

  /**
   * Подтягивать ли CSS компонента как side-effect.
   *
   * - `true` / `'css'` — в `sideEffects` попадёт `@feugene/granularity/components/<Name>/styles.css`.
   *   Пакет сам помечает все `*.css` как side-effect, поэтому неиспользованный
   *   стиль всё равно не попадёт в бандл.
   * - `false` — ничего не подгружаем (если собираете стили отдельно, например
   *   через общий `@feugene/granularity/styles.css`).
   *
   * @default true
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
   * Удобно, если в проекте случайно пересекаются имена: `/^DsInternal/` и т.п.
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
    importStyle: options.importStyle !== false,
    directives: options.directives !== false,
    exclude: options.exclude,
  }
}

/** @internal */
function buildComponentResolver({ prefix, importStyle, exclude }: ResolvedOptions): ComponentResolverObject {
  return {
    type: 'component',
    resolve(name) {
      if (exclude?.test(name))
        return

      if (!name.startsWith(prefix))
        return

      const from = `${GRANULARITY_PACKAGE_NAME}/components/${name}`
      const sideEffects = importStyle
        ? `${GRANULARITY_PACKAGE_NAME}/components/${name}/styles.css`
        : undefined

      return sideEffects ? { name, from, sideEffects } : { name, from }
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
 * Резолвит компоненты и директивы `@feugene/granularity` на **гранулярные
 * sub-path**-экспорты пакета, а не на общий корневой `index`. За счёт этого
 * tree-shaking в приложении потребителя работает максимально плотно: в бандл
 * попадает ровно то, что встретилось в шаблонах.
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
