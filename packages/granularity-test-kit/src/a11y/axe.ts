import type { ElementContext, Result, RunOptions } from 'axe-core'
import axe from 'axe-core'

/** Impact, при которых нарушение считается блокирующим. */
export const BLOCKING_IMPACTS = ['serious', 'critical'] as const

export interface AxeViolationsOptions {
  /** Какие impact считать блокирующими. По умолчанию `serious` и `critical`. */
  impacts?: readonly string[]
  /** Правила поверх дефолтных. Слияние поверхностное, ключ к ключу. */
  rules?: RunOptions['rules']
}

/**
 * Нарушения axe в jsdom — строками `id: help (n)`.
 *
 * Пустой массив читается как «чисто», поэтому вызывающему достаточно
 * `expect(await axeViolations(el)).toEqual([])`, и текст падения он получает
 * готовым: у объектов axe нет короткой формы, в которой видно, что именно
 * сломалось.
 *
 * **`color-contrast` выключен по умолчанию.** Не из снисходительности: в jsdom
 * нет отрисовки, и правилу нечего мерить — цвет оно берёт из вычисленных
 * стилей, которых нет. Настоящий контраст держат гейты палитры и тот же axe в
 * браузере, где правило включено.
 */
export async function axeViolations(
  root: ElementContext,
  options: AxeViolationsOptions = {},
): Promise<string[]> {
  const { impacts = BLOCKING_IMPACTS, rules } = options

  const result = await axe.run(root, {
    resultTypes: ['violations'],
    rules: { 'color-contrast': { enabled: false }, ...rules },
  })

  return result.violations
    .filter((violation: Result) => impacts.includes(violation.impact ?? ''))
    .map((violation: Result) => `${violation.id}: ${violation.help} (${violation.nodes.length})`)
}
