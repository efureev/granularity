import type { GrSchemaFieldInstance } from '../model'

import type { GrSchemaRuleCompilerOptions, GrSchemaRuleTier } from './compile'
import { compileFieldRules } from './compile'

export interface GrSchemaRuleExplanation {
  tier: GrSchemaRuleTier
  /** Что именно проверяет правило: `required`, `min`, `pattern`, `integer`. */
  check: string
  message?: string
}

/**
 * Что и на каком ярусе получилось из узла.
 *
 * Отвечает на единственный вопрос, который задают такому пакету в проде:
 * «почему это поле не проверяется». Без него ответ ищется чтением компилятора.
 */
export function explainRules(
  instance: GrSchemaFieldInstance,
  options: GrSchemaRuleCompilerOptions = {},
): GrSchemaRuleExplanation[] {
  const rules = compileFieldRules(instance, options)
  const result: GrSchemaRuleExplanation[] = []

  for (const rule of rules) {
    if (rule.required) result.push({ tier: 'declarative', check: 'required', message: rule.message })
    if (rule.type) result.push({ tier: 'declarative', check: rule.type, message: rule.message })
    if (rule.len !== undefined) result.push({ tier: 'declarative', check: 'len', message: rule.message })
    if (rule.min !== undefined) result.push({ tier: 'declarative', check: 'min', message: rule.message })
    if (rule.max !== undefined) result.push({ tier: 'declarative', check: 'max', message: rule.message })
    if (rule.pattern) result.push({ tier: 'declarative', check: 'pattern', message: rule.message })
    if (rule.file) result.push({ tier: 'declarative', check: 'file', message: rule.message })

    if (rule.validator) {
      const isResidual = rule.trigger === 'submit' && rule.message === undefined
      result.push({
        tier: isResidual ? 'residual' : 'local',
        check: isResidual ? 'schema' : 'validator',
        message: rule.message,
      })
    }
  }

  if (result.length === 0)
    result.push({ tier: 'declarative', check: 'none' })

  return result
}
