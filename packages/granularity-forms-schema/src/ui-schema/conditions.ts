import { getAtPath, joinPath, splitPath } from '../model'

import type { GrUiCondition, GrUiConditionContext, GrUiConditionRule } from './types'

/**
 * Пустое значение — по правилу ядра.
 *
 * Копия, а не своя логика: условие «поле пусто» обязано означать в `uiSchema`
 * ровно то же, что означает `required` в форме. Разойдись они — поле скрывалось
 * бы там, где форма считает его заполненным.
 */
function isEmptyValue(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0

  return false
}

/**
 * Разрешает путь условия относительно узла.
 *
 * `../type` — соседнее поле той же строки повторителя; без относительных путей
 * условие внутри массива пришлось бы писать по индексу, а он меняется при
 * каждом удалении строки.
 */
export function resolveConditionPath(path: string, name: string): string {
  if (!path.startsWith('.')) return path

  const segments = splitPath(name)
  let rest = path

  while (rest.startsWith('../')) {
    segments.pop()
    rest = rest.slice(3)
  }

  if (rest.startsWith('./')) rest = rest.slice(2)

  return joinPath(segments.join('.'), rest)
}

/**
 * Список правил соединяется через «и».
 *
 * Свой гвард, а не голый `Array.isArray`: тот не сужает `readonly T[]` внутри
 * объединения и оставляет `any[]`, после чего каждое обращение к правилу
 * теряет типизацию.
 */
function isRuleList(condition: GrUiCondition): condition is readonly GrUiConditionRule[] {
  return Array.isArray(condition)
}

function evaluateRule(rule: GrUiConditionRule, ctx: GrUiConditionContext): boolean {
  const value = ctx.get(resolveConditionPath(rule.path, ctx.name))

  if ('eq' in rule && value !== rule.eq) return false
  if ('ne' in rule && value === rule.ne) return false
  if (rule.in && !rule.in.includes(value)) return false
  if (rule.notIn && rule.notIn.includes(value)) return false

  if (rule.truthy !== undefined && Boolean(value) !== rule.truthy) return false
  if (rule.empty !== undefined && isEmptyValue(value) !== rule.empty) return false

  if (rule.gt !== undefined && !(Number(value) > rule.gt)) return false
  if (rule.gte !== undefined && !(Number(value) >= rule.gte)) return false
  if (rule.lt !== undefined && !(Number(value) < rule.lt)) return false
  if (rule.lte !== undefined && !(Number(value) <= rule.lte)) return false

  if (rule.matches !== undefined) {
    // Флаги `g` и `y` двигают `lastIndex` — условие проверяется на каждый рендер.
    const regexp = new RegExp(rule.matches, (rule.matchesFlags ?? '').replace(/[gy]/g, ''))
    if (!regexp.test(String(value ?? ''))) return false
  }

  return true
}

export function evaluateCondition(condition: GrUiCondition, ctx: GrUiConditionContext): boolean {
  if (typeof condition === 'function') return condition(ctx)

  if (isRuleList(condition))
    return condition.every(rule => evaluateRule(rule, ctx))

  if ('all' in condition) return condition.all.every(item => evaluateCondition(item, ctx))
  if ('any' in condition) return condition.any.some(item => evaluateCondition(item, ctx))
  if ('not' in condition) return !evaluateCondition(condition.not, ctx)

  return evaluateRule(condition, ctx)
}

/**
 * Пути, от которых зависит условие.
 *
 * Нужны, чтобы пересчитывать видимость по изменению источника, а не всей формы
 * на каждый ввод символа. Функциональное условие непрозрачно — про него честно
 * возвращается пустой список, и оно пересчитывается всегда.
 */
export function conditionDependencies(condition: GrUiCondition, name = ''): string[] {
  if (typeof condition === 'function') return []

  if (isRuleList(condition))
    return condition.map(rule => resolveConditionPath(rule.path, name))

  if ('all' in condition) return condition.all.flatMap(item => conditionDependencies(item, name))
  if ('any' in condition) return condition.any.flatMap(item => conditionDependencies(item, name))
  if ('not' in condition) return conditionDependencies(condition.not, name)

  return [resolveConditionPath(condition.path, name)]
}

export function createConditionContext(
  model: Record<string, unknown>,
  name: string,
  indices: number[],
): GrUiConditionContext {
  return {
    model,
    name,
    indices,
    get: path => getAtPath(model, path),
  }
}
