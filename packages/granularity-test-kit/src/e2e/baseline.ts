export interface A11yBaseline {
  /** Долг цели: идентификаторы правил, которые для неё уже приняты. */
  knownIssuesFor: (target: string) => readonly string[]
  /** Долг игнорируется — прогон падает на всём, что есть. */
  auditMode: boolean
}

export interface A11yBaselineOptions {
  /** Переменные окружения. Отдельным аргументом — ради тестов самого слоя. */
  env?: Record<string, string | undefined>
  /** Имя переменной режима аудита. */
  auditVar?: string
}

/**
 * Механика зафиксированного долга. Данные остаются у приложения — их знает
 * только оно.
 *
 * Модель гейта: берём блокирующие нарушения, вычитаем принятый долг, падаем на
 * остатке. Так ловятся три вещи разом — регрессия в чистой цели, новая цель без
 * доступности и рост долга; и не ловится сам долг, иначе гейт краснел бы
 * постоянно и его перестали бы читать.
 *
 * Режим аудита (`A11Y_AUDIT=1`) обнуляет долг: прогон падает на **всём** и
 * печатает его списком. Так проверяется, какие строки уже протухли после
 * починки — гейт для этого не годится по построению, он про регрессии.
 */
export function createA11yBaseline(
  known: Record<string, readonly string[]>,
  options: A11yBaselineOptions = {},
): A11yBaseline {
  const { env = globalThis.process?.env ?? {}, auditVar = 'A11Y_AUDIT' } = options
  const auditMode = env[auditVar] === '1'

  return {
    auditMode,
    knownIssuesFor: target => (auditMode ? [] : known[target] ?? []),
  }
}
