import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { basename, dirname, resolve } from 'node:path'
import process from 'node:process'

import { describe, expect, it } from 'vitest'

import { componentDirs, readSources, stripComments } from '../sources'

/**
 * Ветка `calc()` с записанным именем — `calc(var(--gr-z-modal) + N)`.
 * Её читает ЛЮБОЙ вызов, чем бы его ни параметризовали.
 */
const CALC_BRANCH = /calc\(var\(--([\w-]+)\)/g

/**
 * Дефолт композабла — `options.zIndexVar ?? '--gr-z-dropdown'`. Его читает
 * вызов, который своего имени не передал.
 *
 * Класс кавычек обязателен: в `src` дефолт записан одинарными, а в `dist`,
 * откуда его читает гейт спутника, — двойными. Регулярка под одну форму
 * выведет пустой список на половине пакетов, и молча.
 */
const NULLISH_DEFAULT = /\?\?\s*['"`]--([\w-]+)['"`]/g

/** Имена, читаемые кодом: безусловные и дефолтные. */
export interface TokenForms {
  /** Из ветки `calc()`: читает любой вызов. */
  always: string[]
  /** Из `??`-дефолтов: читает вызов, не передавший имени. */
  defaults: string[]
}

/**
 * Имена токенов, вычитанные из тела модуля.
 *
 * Комментарии отбрасываются до матчинга: докблок переживает правку кода и
 * оставил бы гейту имя, которого в коде уже нет.
 */
export function tokenFormsIn(source: string): TokenForms {
  const text = stripComments(source)
  // У обеих форм ровно одна группа, поэтому хвост совпадения — и есть имя.
  const names = (pattern: RegExp): string[] =>
    [...new Set([...text.matchAll(pattern)].flatMap(match => match.slice(1)))]

  return { always: names(CALC_BRANCH), defaults: names(NULLISH_DEFAULT) }
}

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
  /**
   * Модули, из которых выводятся читаемые имена, — по имени файла без
   * расширения и без хеша чанка.
   *
   * Это НЕ «файл композабла»: ветку `calc()` у `useFloating` держит
   * `overlayStack`, а в самом `useFloating` её нет вовсе. Имя читается в
   * вызываемом модуле, поэтому источник задаётся списком, а не выводится из
   * имени функции.
   */
  modules: readonly string[]
  /**
   * Имена, которые формами {@link tokenFormsIn} не выражаются. **Дополняют**
   * выведенное, а не заменяют: замена вернула бы константу, оторванную от кода.
   */
  always?: readonly string[]
  /** Перекрытие выведенного дефолта — когда их несколько и выбор из кода не виден. */
  defaultToken?: string
  /** Как достать переданное имя из исходников вызывающего. Без флага `g`. */
  argPattern?: RegExp
}

/**
 * Композаблы слоёв `@feugene/granularity`.
 *
 * Имена токенов здесь не записаны: их вычитывает {@link tokenFormsIn} из
 * перечисленных модулей. Записанное имя разошлось бы с кодом молча — гейт
 * продолжал бы требовать старое и оставался зелёным.
 */
export const OVERLAY_COMPOSABLES: readonly DynamicTokenComposable[] = [
  {
    name: 'useFloating',
    // `overlayStack` — ради ветки `calc(var(--gr-z-modal) + N)`, которая
    // поднимает панель, открытую ВНУТРИ модалки, над ней.
    modules: ['useFloating', 'overlayStack'],
    argPattern: /zIndexVar:\s*'--([\w-]+)'/,
  },
  { name: 'useModalOverlay', modules: ['useModalOverlay'] },
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
   * Корни, в которых ищутся модули композаблов, в порядке предпочтения.
   * По умолчанию — `<cwd>/src` и `dist` установленного `@feugene/granularity`:
   * у ядра модуль находится в исходниках, у спутника — в собранном ядре.
   *
   * Опцией, а не догадкой: спутник вправе линковаться и через workspace, и из
   * реестра.
   */
  composableSources?: readonly string[]
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

const MODULE_EXTENSION = /\.(?:ts|js|mjs)$/
/** Хвост, который бандлер приписывает чанку: `overlayStack-DH4Z7am1.js`. */
const CHUNK_HASH = /-[\w-]{8}$/

function isModuleFile(fileName: string, moduleName: string): boolean {
  if (!MODULE_EXTENSION.test(fileName) || fileName.endsWith('.d.ts') || fileName.includes('.test.'))
    return false

  const stem = fileName.slice(0, fileName.lastIndexOf('.'))

  return stem === moduleName || stem.replace(CHUNK_HASH, '') === moduleName
}

function findModuleFiles(root: string, moduleName: string): string[] {
  if (!existsSync(root))
    return []

  const found: string[] = []

  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = resolve(dir, entry.name)

      if (entry.isDirectory()) {
        if (entry.name !== '__tests__')
          walk(full)
        continue
      }

      if (isModuleFile(entry.name, moduleName))
        found.push(full)
    }
  }

  walk(root)
  return found
}

/** `dist` установленного ядра — оттуда композабл виден спутнику. */
function coreDistDir(): string | undefined {
  try {
    const require = createRequire(resolve(process.cwd(), 'package.json'))

    return resolve(dirname(require.resolve('@feugene/granularity/package.json')), 'dist')
  }
  catch {
    return undefined
  }
}

function defaultComposableSources(): string[] {
  const core = coreDistDir()

  return [resolve(process.cwd(), 'src'), ...(core === undefined ? [] : [core])].filter(dir => existsSync(dir))
}

/** Композабл с именами, вычитанными из кода, либо с причиной, по которой не вышло. */
export interface ResolvedComposable {
  name: string
  always: string[]
  defaultToken?: string
  argPattern?: RegExp
  /** Файлы, из которых выведено. */
  files: string[]
  /** Заполнено — гейт посмотреть не смог и обязан упасть. */
  problem?: string
}

/**
 * Вычитывает имена, которые читает композабл.
 *
 * Ослепнуть молча гейту нельзя, поэтому два случая объявляются проблемой, а не
 * пустым результатом: модуль не найден (нечего читать) и из найденного не
 * выведено ни одного имени (форма чтения регулярками не покрыта). И то и другое
 * оставило бы вызывающих без проверки при зелёном прогоне.
 */
export function resolveComposable(
  composable: DynamicTokenComposable,
  roots: readonly string[],
): ResolvedComposable {
  const base = { name: composable.name, argPattern: composable.argPattern }
  const files: string[] = []
  const missing: string[] = []

  for (const moduleName of composable.modules) {
    const hit = roots.map(root => findModuleFiles(root, moduleName)).find(list => list.length > 0)

    if (hit === undefined)
      missing.push(moduleName)
    else
      files.push(...hit)
  }

  if (missing.length > 0) {
    return {
      ...base,
      always: [],
      files,
      problem: `модули не найдены: ${missing.join(', ')}. Искали в: ${roots.join(', ') || '—'}. `
        + 'Ядро собрано (`yarn build:granularity`)? Иначе задай `composableSources`.',
    }
  }

  const forms = files.map(file => tokenFormsIn(readFileSync(file, 'utf8')))
  const always = [...new Set([...forms.flatMap(form => form.always), ...(composable.always ?? [])])]
  const defaults = [...new Set(forms.flatMap(form => form.defaults))]
  const defaultToken = composable.defaultToken ?? defaults[0]
  const shown = files.map(file => basename(file)).join(', ')

  if (composable.defaultToken === undefined && defaults.length > 1) {
    return {
      ...base,
      always,
      files,
      problem: `дефолтов выведено несколько (${defaults.join(', ')}), и какой читает вызов без `
        + `имени, из кода не видно (${shown}). Задай \`defaultToken\` явно.`,
    }
  }

  if (always.length === 0 && defaultToken === undefined) {
    return {
      ...base,
      always,
      files,
      problem: `из ${shown} не выведено ни одного имени. Токен читается формой, которой гейт не `
        + 'знает (сейчас их две: ветка `calc()` и `??`-дефолт) — вызывающие остались бы без проверки.',
    }
  }

  return { ...base, always, defaultToken, files }
}

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
 * Что именно читает композабл, гейт вычитывает из его кода
 * ({@link resolveComposable}), а не берёт из списка: список разошёлся бы с
 * кодом молча — и продолжал бы требовать имя, которое никто не читает.
 */
export function defineDynamicTokensGate(options: DynamicTokensGateOptions): void {
  const componentsDir = options.componentsDir ?? resolve(process.cwd(), 'src/components')
  const roots = options.composableSources ?? defaultComposableSources()
  const composables = (options.composables ?? OVERLAY_COMPOSABLES)
    .map(composable => resolveComposable(composable, roots))
  const exceptions = options.appSuppliedName ?? {}
  const known = options.knownTokens ? new Set(options.knownTokens.map(t => t.replace(/^--/, ''))) : undefined

  const sources = sourcesByComponent(componentsDir, options.componentConfigs)
  const declaredOf = (name: string): string[] => [...(options.componentConfigs[name]?.dynamicTokens ?? [])]

  describe('dynamicTokens: вызовы композаблов, собирающих var()', () => {
    for (const composable of composables) {
      describe(composable.name, () => {
        if (composable.problem !== undefined) {
          it('имена вычитаны из кода композабла', () => {
            // Гейт, который не может посмотреть, обязан падать: зелёный
            // означал бы только то, что он ослеп.
            expect.fail(`${composable.name}: ${composable.problem}`)
          })
          return
        }

        const callers = [...sources]
          .filter(([, source]) => new RegExp(`\\b${composable.name}\\(`).test(source))
          .map(([name]) => name)

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
          const reads = [...new Set([...(own === undefined ? [] : [own]), ...composable.always])]
          const missing = reads.filter(token => !declared.includes(token))

          expect(
            missing,
            `${component} читает ${reads.join(', ')}, а объявляет ${declared.join(', ') || '—'}`,
          ).toEqual([])
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
