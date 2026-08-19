/** Impact, при которых нарушение блокирует. `moderate` и `minor` гейт не держит. */
export const BLOCKING_IMPACTS = ['serious', 'critical'] as const

/** Нарушение в виде, пригодном для сообщения об ошибке. */
export interface A11yRegression {
  id: string
  impact: string | null
  nodes: number
  help: string
}

/** То немногое из результата axe, что нужно отбору. */
export interface A11yViolationLike {
  id: string
  impact?: string | null
  help: string
  nodes: readonly unknown[]
}

export interface SelectRegressionsOptions {
  impacts?: readonly string[]
  /** Зафиксированный долг цели: идентификаторы правил axe. */
  known?: readonly string[]
}

/**
 * Нарушения сверх зафиксированного долга.
 *
 * Вычитание идёт по идентификатору правила, а не по узлам: одна строка долга
 * гасит правило на всей цели. Гранулярность выбрана осознанно — список узлов
 * меняется от любой правки разметки, и долг, записанный узлами, пришлось бы
 * переписывать чаще, чем чинить.
 *
 * Функция отделена от прогона намеренно: она чистая, и проверить модель гейта
 * можно, не поднимая браузер.
 */
export function selectRegressions(
  violations: readonly A11yViolationLike[],
  options: SelectRegressionsOptions = {},
): A11yRegression[] {
  const { impacts = BLOCKING_IMPACTS, known = [] } = options
  const silenced = new Set(known)

  return violations
    .filter(violation => impacts.includes(violation.impact ?? ''))
    .filter(violation => !silenced.has(violation.id))
    .map(violation => ({
      id: violation.id,
      impact: violation.impact ?? null,
      nodes: violation.nodes.length,
      help: violation.help,
    }))
}
