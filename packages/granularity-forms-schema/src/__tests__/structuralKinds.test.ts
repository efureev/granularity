import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * Гейт структурных видов.
 *
 * Объект, массив объектов и объединение рисуются **шаблоном**, а не реестром
 * рендереров: у каждого своя поверхность — заголовок раздела, кнопки строк,
 * переключатель ветки, — и одним контролом в `GrFormField` они не выражаются.
 *
 * Дефект, ради которого гейт написан, случался дважды подряд: развилка по виду
 * узла жила в четырёх копиях, новый вид вписали не во все, и поле молча не
 * нарисовалось — ни ошибки, ни предупреждения, просто пустое место в форме.
 * Копии сведены в `SchemaNodeSwitch.vue`, и гейт держит это положение: развилка
 * одна, а места, перебирающие поля, обязаны звать её, а не ветвиться сами.
 */
const COMPONENTS_DIR = join(__dirname, '..', 'components', 'GrSchemaForm')
const SWITCH_FILE = 'SchemaNodeSwitch.vue'

/** Перебор полей — по нему опознаётся место, обязанное знать все виды. */
const FIELD_LOOP = /v-for="field in /g
const SWITCH_CALL = /<SchemaNodeSwitch\b/g

/** Ветвление по виду узла: то, чему место только в развилке. */
const KIND_BRANCH = /field\.node\.kind === /g

/** Счёт, а не `test`: у глобального regex `test` тащит `lastIndex` между вызовами. */
function count(source: string, pattern: RegExp): number {
  return source.match(pattern)?.length ?? 0
}

const STRUCTURAL_KINDS = ['union', 'object', 'array'] as const

function componentFiles(): { file: string, source: string }[] {
  return readdirSync(COMPONENTS_DIR)
    .filter(file => file.endsWith('.vue'))
    .map(file => ({ file, source: readFileSync(join(COMPONENTS_DIR, file), 'utf8') }))
}

describe('развилка по виду узла', () => {
  const files = componentFiles()
  const loopers = files.filter(entry => count(entry.source, FIELD_LOOP) > 0)

  /** Пустой список означал бы, что гейт перестал что-либо измерять. */
  it('находит места, где перебираются поля', () => {
    expect(loopers.length).toBeGreaterThanOrEqual(3)
  })

  it('каждое из них зовёт развилку, а не ветвится само', () => {
    const missing = loopers
      .filter(entry => count(entry.source, SWITCH_CALL) < count(entry.source, FIELD_LOOP))
      .map(entry => entry.file)

    expect(missing).toEqual([])
  })

  it('своей развилки не завёл никто, кроме неё самой', () => {
    const own = files
      .filter(entry => entry.file !== SWITCH_FILE && count(entry.source, KIND_BRANCH) > 0)
      .map(entry => entry.file)

    expect(own).toEqual([])
  })

  it.each(STRUCTURAL_KINDS)('«%s» в развилке разобран', (kind) => {
    const source = readFileSync(join(COMPONENTS_DIR, SWITCH_FILE), 'utf8')

    expect(source).toContain(`kind === '${kind}'`)
  })
})
