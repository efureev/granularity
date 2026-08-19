import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

import { describe, expect, it } from 'vitest'

import { componentDirs } from '../sources'

const AUGMENTATION = /declare module '([^']+)'/g

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

    it.runIf(options.registryDeclaration !== undefined)('реестр объявлен там, куда ссылаются аугментации', () => {
      const declaration = options.registryDeclaration!
      const registry = readFileSync(resolve(pkgDir, declaration.path), 'utf8')

      expect(registry).toContain(declaration.contains)
    })
  })
}
