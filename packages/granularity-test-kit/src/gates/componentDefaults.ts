import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

import { describe, expect, it } from 'vitest'

import { componentDirs, readSources, stripComments } from '../sources'

const AUGMENTATION = /declare module '([^']+)'/g

/**
 * Свидетельства того, что настраиваемый проп кто-то читает.
 *
 * Каналов четыре, и это не запас прочности: наивная проверка «есть строка
 * `useGrComponentProp('GrX', 'key'`» даёт шестнадцать красных, среди которых
 * ноль виноватых. Каждый канал закрывает свою форму записи, встречающуюся в
 * репозитории.
 */
const LITERAL_PROP = /useGrComponentProp\(\s*'(Gr\w+)'\s*,\s*'(\w+)'/g
const DYNAMIC_PROP = /useGrComponentProp\(\s*(?!['\s])[^,]*,\s*'(\w+)'/g
const LITERAL_SIZE = /useGrComponentSize[\s\S]{0,160}?\{\s*component:\s*'(Gr\w+)'/g
const DYNAMIC_SIZE = /useGrComponentSize[\s\S]{0,160}?\{\s*component:\s*(?!')/g
const MANUAL_DEFAULTS = /useGrComponentDefaults\(\s*'(Gr\w+)'/g
const MANUAL_READ = /\.value\.(\w+)/g

export interface ReadEvidence {
  /** Ключи, прочитанные для конкретного компонента. */
  byComponent: Map<string, Set<string>>
  /** Ключи, прочитанные с нелитеральным именем компонента: засчитываются всем. */
  wildcard: Set<string>
  /** Сколько свидетельств собрано всего — страховка от сломавшейся регулярки. */
  total: number
}

function add(map: Map<string, Set<string>>, component: string, key: string): void {
  const keys = map.get(component) ?? new Set<string>()

  keys.add(key)
  map.set(component, keys)
}

/**
 * Собирает свидетельства по **всему** `src`, а не по директории компонента.
 *
 * Резолв бывает вынесен в общий модуль вне `src/components` — у chrono все
 * четыре пикера читают свои пропы из `src/internal/usePickerShell.ts`, и по
 * директории компонента там не найти ничего.
 */
export function collectReadsFrom(sources: readonly { source: string }[]): ReadEvidence {
  const evidence: ReadEvidence = { byComponent: new Map(), wildcard: new Set(), total: 0 }

  for (const { source } of sources) {
    const code = stripComments(source)

    for (const [, component, key] of code.matchAll(LITERAL_PROP)) {
      add(evidence.byComponent, component!, key!)
      evidence.total += 1
    }

    for (const [, component] of code.matchAll(LITERAL_SIZE)) {
      add(evidence.byComponent, component!, 'size')
      evidence.total += 1
    }

    // Имя компонента приходит переменной — какому именно оно принадлежит, из
    // текста не узнать: связать `usePickerShell` с четырьмя пикерами можно
    // только разобрав тип-объединение. Ключ засчитывается всем компонентам
    // пакета. Огрубление даёт ложные **отрицания**, но не ложные срабатывания,
    // а гейт, который врёт, выключают.
    for (const [, key] of code.matchAll(DYNAMIC_PROP)) {
      evidence.wildcard.add(key!)
      evidence.total += 1
    }

    if (DYNAMIC_SIZE.test(code)) {
      evidence.wildcard.add('size')
      evidence.total += 1
    }
    DYNAMIC_SIZE.lastIndex = 0

    // Ручная цепочка: у пропа производный дефолт, и `useGrComponentProp` с его
    // константным `fallback` не годится. Ключи такого файла засчитываются
    // компонентам, чьи дефолты он взял.
    const manual = [...code.matchAll(MANUAL_DEFAULTS)].map(match => match[1]!)

    if (manual.length > 0) {
      for (const [, key] of code.matchAll(MANUAL_READ)) {
        for (const component of manual) {
          add(evidence.byComponent, component, key!)
          evidence.total += 1
        }
      }
    }
  }

  return evidence
}

function collectReads(srcDir: string): ReadEvidence {
  return collectReadsFrom(readSources({ dir: srcDir, extensions: /\.(?:ts|vue)$/ }))
}

export interface ComponentDefaultsGateOptions {
  /** Корень пакета; по умолчанию — cwd, из которого запущен vitest. */
  pkgDir?: string
  /**
   * Единственный допустимый адрес аугментации — модуль, где реестр объявлен.
   * У ядра это относительный путь (`../../composables/useGrComponentConfig`),
   * у спутника — публичный подпуть
   * (`@feugene/granularity/composables/useGrComponentConfig`).
   */
  registryModule: string
  /** Сколько компонентов с `defaults.ts` обязано быть в пакете. */
  minComponents?: number
  /**
   * Проверить, что реестр объявлен там, куда ссылаются аугментации, — это
   * имеет смысл только в пакете, который его и объявляет (в ядре).
   */
  registryDeclaration?: {
    /** Путь файла относительно корня пакета. */
    path: string
    /** Строка, по которой видно объявление. */
    contains: string
  }
}


/** Ключи `ConfigurableProps` — то, что объявлено настраиваемым. */
function configurableKeys(source: string): string[] {
  const start = source.search(/interface\s+\w*ConfigurableProps\s*\{/)
  if (start === -1) return []

  const body = balanced(source, source.indexOf('{', start), '{', '}')

  // Строки-объявления, а не блочный разбор: комментарии и пустые строки просто
  // не совпадут. Без вложенных `\s*` подряд — они дают экспоненциальный откат.
  return body
    .split('\n')
    .map(line => /^\s*(\w+)\??:/.exec(line.trim() === '' ? '' : line))
    .filter((match): match is RegExpExecArray => match !== null)
    .map(match => match[1]!)
}

/**
 * Содержимое парного блока от позиции открывающей скобки.
 *
 * Счётчиком, а не регуляркой: терминаторное выражение разбирает 79 SFC из 80 и
 * спотыкается на `GrIcon.vue`, где `withDefaults` отформатирован в три строки.
 */
function balanced(source: string, openIndex: number, open: string, close: string): string {
  if (openIndex === -1) return ''

  let depth = 0

  for (let i = openIndex; i < source.length; i += 1) {
    if (source[i] === open) depth += 1
    else if (source[i] === close) {
      depth -= 1
      if (depth === 0) return source.slice(openIndex + 1, i)
    }
  }

  return ''
}

/** Объект дефолтов из `withDefaults(defineProps<…>(), { … })`. */
function withDefaultsBody(source: string): { found: boolean, body: string } {
  const call = source.indexOf('withDefaults(')
  if (call === -1) return { found: false, body: '' }

  const args = balanced(source, source.indexOf('(', call), '(', ')')
  const objectStart = args.indexOf('{', args.indexOf('defineProps'))

  return { found: true, body: balanced(args, objectStart, '{', '}') }
}

/**
 * Гейт адреса аугментации реестра `componentDefaults`.
 *
 * Реестр объявлен в `composables/useGrComponentConfig` — дополнять его можно
 * только там. Через реэкспорт (например баррель `GrConfigProvider`, который тип
 * лишь пробрасывает) слияние работает, пока аугментация в программе одна: стоит
 * появиться второй, дополняющей объявление напрямую, и первая молча
 * отваливается. Ошибки при этом нет — просто `componentDefaults` перестаёт
 * знать про компонент, а вместе с ним и `useGrComponentProp`.
 *
 * Ровно на это напоролся `@feugene/granularity-chrono`: его компоненты выпадали
 * из реестра, как только в ту же программу приезжал любой `defaults.d.ts` ядра.
 */
export function defineComponentDefaultsGate(options: ComponentDefaultsGateOptions): void {
  const pkgDir = options.pkgDir ?? process.cwd()
  const componentsDir = resolve(pkgDir, 'src/components')

  const files = componentDirs(componentsDir)
    .map(component => ({ component, path: resolve(componentsDir, component, 'defaults.ts') }))
    .filter(({ path }) => existsSync(path))
    .map(({ component, path }) => ({ component, source: readFileSync(path, 'utf8') }))

  const reads = collectReads(resolve(pkgDir, 'src'))

  describe('реестр componentDefaults', () => {
    it('в пакете есть компоненты с настраиваемыми пропами', () => {
      // Гейт на пустом списке зелен всегда — проверяем, что список не опустел.
      expect(files.length).toBeGreaterThanOrEqual(options.minComponents ?? 1)
    })

    it.each(files.map(file => [file.component, file.source] as const))(
      '%s/defaults.ts дополняет реестр по месту объявления',
      (_component, source) => {
        const modules = [...source.matchAll(AUGMENTATION)].map(match => match[1])

        expect(modules, 'defaults.ts обязан объявлять аугментацию реестра').not.toHaveLength(0)
        for (const module of modules) {
          expect(module, `аугментация через реэкспорт: ${module}`).toBe(options.registryModule)
        }
      },
    )

    /**
     * Настраиваемый проп обязан иметь в `withDefaults` ровно `undefined`.
     *
     * Иначе Vue подставит объявленный дефолт раньше, чем компонент заглянет в
     * `GrConfigProvider`, и настройка не сработает **никогда, молча** — изнутри
     * «пользователь передал значение» неотличимо от «сработал дефолт». Ровно
     * так `GrSchemaForm.headingLevel` был объявлен настраиваемым и им не был.
     */
    it.each(files.map(file => [file.component, file.source] as const))(
      '%s: у настраиваемых пропов в withDefaults стоит undefined',
      (component, source) => {
        const keys = configurableKeys(source)
        expect(keys, `${component}/defaults.ts: не разобран ConfigurableProps`).not.toHaveLength(0)

        // Только главный SFC: соседи по семейству (`GrCollapseItem`,
        // `GrSchemaArrayField`) получают те же значения из контекста родителя, а
        // одноимённый проп у них — внутренний, и `undefined` там не при чём.
        const dir = resolve(componentsDir, component)
        const sfcs = readdirSync(dir).filter(file => file === `${component}.vue`)
        const offenders: string[] = []

        for (const file of sfcs) {
          const sfc = readFileSync(resolve(dir, file), 'utf8')
          const { found, body } = withDefaultsBody(sfc)
          // Без `withDefaults` Vue и так отдаёт `undefined` — правило не о чем.
          if (!found) continue

          for (const key of keys) {
            const match = body.match(new RegExp(`(?:^|[,{])\\s*${key}\\s*:\\s*([^,\n]+)`))
            if (!match) continue

            const value = match[1]!.trim()
            if (value !== 'undefined')
              offenders.push(`${file}: ${key}: ${value}`)
          }
        }

        expect(offenders, offenders.join('\n')).toEqual([])
      },
    )

    /**
     * Объявить проп настраиваемым и не прочитать его — обещание, которого никто
     * не выполняет: `GrConfigProvider` настраивает, компонент не смотрит, а
     * узнать об этом неоткуда. Так прожили `showWeekNumbers` у chrono и четыре
     * ключа `GrSchemaForm`; оба раза их нашли руками.
     */
    it('каждый настраиваемый проп кто-то читает', () => {
      const offenders = files.flatMap(({ component, source }) => {
        const read = reads.byComponent.get(component) ?? new Set<string>()

        return configurableKeys(source)
          .filter(key => !read.has(key) && !reads.wildcard.has(key))
          .map(key => `${component}.${key}`)
      })

      expect(
        offenders,
        `${offenders.join('\n')}\n\nобъявлены настраиваемыми, но не читаются: дочитай проп или убери ключ из реестра`,
      ).toEqual([])
    })

    it('разбор нашёл чтения — регулярки не молчат', () => {
      // Сломанное выражение иначе зеленит проверку выше на любом пакете.
      expect(reads.total, 'ни одного чтения настраиваемого пропа не найдено').toBeGreaterThanOrEqual(files.length)
    })

    it.runIf(options.registryDeclaration !== undefined)('реестр объявлен там, куда ссылаются аугментации', () => {
      const declaration = options.registryDeclaration!
      const registry = readFileSync(resolve(pkgDir, declaration.path), 'utf8')

      expect(registry).toContain(declaration.contains)
    })
  })
}
