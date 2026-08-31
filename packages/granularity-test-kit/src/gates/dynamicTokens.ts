import { readFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import process from 'node:process'

import { describe, expect, it } from 'vitest'

import { componentDirs, readSources, stripComments } from '../sources'

/**
 * Композабл, который собирает `var()` внутри себя.
 *
 * Вызывающий компонент читает токен, имени которого в его исходниках нет:
 * оно уходит параметром, а `var()` склеивается в рантайме. Ни один
 * статический анализ такое не находит.
 */
export interface DynamicTokenComposable {
  /** Имя функции, как оно написано в вызове. */
  name: string
  /** Токены, которые читает ЛЮБОЙ вызов, чем бы его ни параметризовали. */
  always?: readonly string[]
  /** Токен, который читается, когда вызывающий имени не передал. */
  defaultToken?: string
  /** Как достать переданное имя из исходников вызывающего. Без флага `g`. */
  argPattern?: RegExp
}

/**
 * Композаблы слоёв `@feugene/granularity`.
 *
 * `always: ['gr-z-modal']` у `useFloating` — не перестраховка: ветка
 * `calc(var(--gr-z-modal) + N)` поднимает панель, открытую ВНУТРИ модалки,
 * над ней. Её читает каждый вызывающий, чем бы он ни параметризовал свой слой.
 */
export const OVERLAY_COMPOSABLES: readonly DynamicTokenComposable[] = [
  {
    name: 'useFloating',
    always: ['gr-z-modal'],
    defaultToken: 'gr-z-dropdown',
    argPattern: /zIndexVar:\s*'--([\w-]+)'/,
  },
  { name: 'useModalOverlay', always: ['gr-z-modal'] },
]

/** Дескриптор компонента в объёме, который нужен гейту. */
export interface DynamicTokensComponentConfig {
  dynamicTokens?: readonly string[]
  group?: string
}

export interface DynamicTokensGateOptions {
  /** Реестр компонентов пакета: имя → дескриптор. */
  componentConfigs: Readonly<Record<string, DynamicTokensComponentConfig>>
  /**
   * Имена всех токенов дизайн-системы БЕЗ префикса `--`. Задан — гейт ловит
   * объявление с опечаткой и объявление, протухшее после переименования.
   */
  knownTokens?: readonly string[]
  /** Что считать источником рантайм-сборки. По умолчанию — {@link OVERLAY_COMPOSABLES}. */
  composables?: readonly DynamicTokenComposable[]
  /**
   * Компоненты, которым объявлять нечего: имя приходит ОТ ПРИЛОЖЕНИЯ
   * (проп-escape-hatch), и держать его — забота потребителя. Значение —
   * причина; она же печатается, когда запись протухнет.
   */
  appSuppliedName?: Readonly<Record<string, string>>
  /** Директория компонентов; по умолчанию — `<cwd>/src/components`. */
  componentsDir?: string
}

/** Рантайм-сборка `var()`: шаблонная форма и склейка, во что её превращает минификатор. */
const ASSEMBLY = /var\(\$\{|(['"`])var\(\1\s*\+/

function sourcesByComponent(
  componentsDir: string,
  configs: DynamicTokensGateOptions['componentConfigs'],
): Map<string, string> {
  // Пути от `componentDirs` бывают вложенными (`groupA/GrX`), а ключи реестра
  // — плоские имена. Сводим по последнему сегменту.
  const dirByName = new Map(componentDirs(componentsDir).map(dir => [basename(dir), dir]))
  const files = readSources({ dir: componentsDir })
  const out = new Map<string, string>()

  for (const [name, config] of Object.entries(configs)) {
    const own = dirByName.get(name)
    if (own === undefined)
      continue

    // Общий SFC группы живёт вне директории компонента, а зовёт композабл
    // часто именно он: у графиков `useFloating` вызывает рама, а не график.
    const prefixes = [`${own}/`]
    if (config.group)
      prefixes.push(`${config.group}/shared/`)

    out.set(
      name,
      files
        .filter(file => prefixes.some(prefix => file.path.startsWith(prefix)))
        .map(file => stripComments(file.source))
        .join('\n'),
    )
  }

  return out
}

/**
 * Гейт объявлений `dynamicTokens`.
 *
 * Токен, чьё имя собирается в рантайме, при включённой обрезке
 * (`pruneTokens` пресета) удаляется молча: сборка зелёная, `z-index`
 * разрешается в `unset`, панель уезжает под соседний слой. Ни один другой
 * гейт этого не видит — CSS остаётся валидным.
 *
 * Три правила. Первые два знают про конкретные композаблы; третье ловит
 * источник, о котором гейт ещё не знает, и потому переживает появление
 * нового.
 */
export function defineDynamicTokensGate(options: DynamicTokensGateOptions): void {
  const componentsDir = options.componentsDir ?? resolve(process.cwd(), 'src/components')
  const composables = options.composables ?? OVERLAY_COMPOSABLES
  const exceptions = options.appSuppliedName ?? {}
  const known = options.knownTokens ? new Set(options.knownTokens.map(t => t.replace(/^--/, ''))) : undefined

  const sources = sourcesByComponent(componentsDir, options.componentConfigs)
  const declaredOf = (name: string): string[] => [...(options.componentConfigs[name]?.dynamicTokens ?? [])]

  describe('dynamicTokens: вызовы композаблов, собирающих var()', () => {
    for (const composable of composables) {
      const callers = [...sources]
        .filter(([, source]) => new RegExp(`\\b${composable.name}\\(`).test(source))
        .map(([name]) => name)

      describe(composable.name, () => {
        if (callers.length === 0) {
          it('в пакете не вызывается', () => {
            expect(callers).toEqual([])
          })
          return
        }

        it.each(callers)('%s объявляет то, что читает', (component) => {
          const declared = declaredOf(component)
          const passed = composable.argPattern
            ? sources.get(component)?.match(composable.argPattern)?.[1]
            : undefined
          const own = passed ?? composable.defaultToken

          if (own !== undefined)
            expect(declared).toContain(own)

          for (const token of composable.always ?? [])
            expect(declared).toContain(token)
        })
      })
    }
  })

  describe('dynamicTokens: собственная сборка var()', () => {
    it('компонент, собирающий var() сам, объявляет хоть что-то', () => {
      const offenders = [...sources]
        .filter(([name, source]) => (
          ASSEMBLY.test(source) && declaredOf(name).length === 0 && !(name in exceptions)
        ))
        .map(([name]) => name)

      expect(offenders).toEqual([])
    })

    it('список исключений не протух', () => {
      const stale = Object.keys(exceptions)
        .filter(name => sources.has(name) && !ASSEMBLY.test(sources.get(name) ?? ''))

      expect(stale).toEqual([])
    })
  })

  describe('dynamicTokens: объявления не протухли', () => {
    it('каждое объявленное имя существует среди токенов пакета', () => {
      if (known === undefined) {
        expect(known).toBeUndefined()
        return
      }

      const unknown = Object.keys(options.componentConfigs).flatMap(name => declaredOf(name)
        .filter(token => !token.endsWith('*') && !known.has(token))
        .map(token => `${name}: --${token}`))

      expect(unknown).toEqual([])
    })
  })
}
