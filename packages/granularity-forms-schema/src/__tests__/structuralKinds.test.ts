import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * Гейт структурных видов.
 *
 * Объект, массив объектов и объединение рисуются **шаблоном**, а не реестром
 * рендереров: у каждого своя поверхность — заголовок раздела, кнопки строк,
 * переключатель ветки, — и одним контролом в `GrFormField` они не выражаются.
 * Из-за этого развилка по виду узла повторяется в каждом шаблоне, который
 * перебирает поля, и её копий уже четыре.
 *
 * Дефект, ради которого гейт написан, случался дважды подряд: новый вид узла
 * вписали в одну копию из четырёх, и поле в остальных местах не нарисовалось
 * **молча** — ни ошибки, ни предупреждения, просто пустое место в форме.
 *
 * Проверка текстовая, потому что дешёвая и точная: в файле, который перебирает
 * поля, столько же веток каждого структурного вида, сколько самих переборов.
 */
const COMPONENTS_DIR = join(__dirname, '..', 'components', 'GrSchemaForm')

/** Перебор полей — по нему и опознаётся место, обязанное знать все виды. */
const FIELD_LOOP = /v-for="field in /g

const STRUCTURAL_BRANCHES: Record<string, RegExp> = {
  объединение: /field\.node\.kind === 'union'/g,
  объект: /field\.node\.kind === 'object'/g,
}

function templatesWithFieldLoops(): { file: string, source: string, loops: number }[] {
  return readdirSync(COMPONENTS_DIR)
    .filter(file => file.endsWith('.vue'))
    .map(file => {
      const source = readFileSync(join(COMPONENTS_DIR, file), 'utf8')
      return { file, source, loops: source.match(FIELD_LOOP)?.length ?? 0 }
    })
    .filter(entry => entry.loops > 0)
}

describe('развилка по виду узла', () => {
  const templates = templatesWithFieldLoops()

  /** Пустой список означал бы, что гейт перестал что-либо измерять. */
  it('находит места, где перебираются поля', () => {
    expect(templates.length).toBeGreaterThanOrEqual(3)
  })

  it.each(Object.entries(STRUCTURAL_BRANCHES))('%s разобрано в каждом из них', (_kind, branch) => {
    const missing = templates
      .filter(entry => (entry.source.match(branch)?.length ?? 0) < entry.loops)
      .map(entry => entry.file)

    expect(missing).toEqual([])
  })
})
