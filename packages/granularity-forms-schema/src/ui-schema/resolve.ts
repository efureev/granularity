import type { GrSchemaFieldInstance, GrSchemaNode } from '../model'

import { createConditionContext, evaluateCondition } from './conditions'
import type {
  GrResolvedFieldUi,
  GrUiCondition,
  GrUiFieldOptions,
  GrUiSchema,
} from './types'

function resolveFlag(
  value: boolean | GrUiCondition | undefined,
  fallback: boolean,
  model: Record<string, unknown>,
  instance: GrSchemaFieldInstance,
): boolean {
  if (value === undefined)
    return fallback
  if (typeof value === 'boolean')
    return value

  return evaluateCondition(value, createConditionContext(model, instance.name, instance.indices))
}

/**
 * Сливает описание поля: `uiSchema` сильнее схемы, узел даёт умолчания.
 *
 * Подпись берётся из `uiSchema`, потом из `title` схемы, и только потом
 * остаётся именем ключа: `title` пишут не всегда, а поле без подписи —
 * недоступное поле.
 */
export function resolveFieldUi(
  instance: GrSchemaFieldInstance,
  ui: GrUiSchema | undefined,
  model: Record<string, unknown>,
): GrResolvedFieldUi {
  const node: GrSchemaNode = instance.node
  const options: GrUiFieldOptions = ui?.fields?.[instance.templatePath] ?? {}
  const defaults = ui?.defaults ?? {}

  const hiddenByList = ui?.hidden?.includes(instance.templatePath) ?? false
  const visible = !hiddenByList
    && options.hidden !== true
    && resolveFlag(options.when, true, model, instance)

  return {
    label: options.label ?? node.title ?? humanize(node.key),
    hint: options.hint ?? node.description,
    placeholder: options.placeholder ?? node.placeholder,
    widget: options.widget,
    component: options.component,
    controlProps: options.controlProps ?? {},
    options: options.options ?? node.options,
    span: options.span ?? defaults.span,
    visible,
    readonly: resolveFlag(options.readonly, node.readOnly, model, instance),
    disabled: resolveFlag(options.disabled, false, model, instance),
    required: options.required ?? node.required,
    clearOnHide: options.clearOnHide ?? false,
    labelPosition: options.labelPosition ?? defaults.labelPosition,
    labelWidth: options.labelWidth ?? defaults.labelWidth,
    showMessage: options.showMessage ?? defaults.showMessage ?? true,
    array: options.array,
  }
}

/** `firstName` / `first_name` / `first-name` → «First name». */
export function humanize(key: string): string {
  if (key === '' || key === '*')
    return ''

  const words = key
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .trim()
    .toLowerCase()

  return words.charAt(0).toUpperCase() + words.slice(1)
}

/**
 * Порядок полей: сначала явный, затем всё остальное в порядке схемы.
 *
 * `'*'` в списке — место, куда встают неперечисленные. Без него добавленное в
 * схему поле молча исчезало бы из формы, стоило потребителю один раз задать
 * порядок.
 */
export function applyOrder<T extends { templatePath: string }>(
  items: T[],
  order: string[] | undefined,
): T[] {
  if (!order || order.length === 0)
    return items

  const rest = items.filter(item => !order.includes(item.templatePath))
  const result: T[] = []

  for (const key of order) {
    if (key === '*') {
      result.push(...rest)
      continue
    }

    const found = items.filter(item => item.templatePath === key)
    result.push(...found)
  }

  // Список без `'*'` — не повод терять поля: дописываем хвост.
  if (!order.includes('*'))
    result.push(...rest)

  return result
}

/** Слияние двух `uiSchema`: правая сильнее по каждому листу. */
export function mergeUiSchema(base?: GrUiSchema, over?: GrUiSchema): GrUiSchema {
  if (!base)
    return over ?? {}
  if (!over)
    return base

  const fields: Record<string, GrUiFieldOptions> = { ...base.fields }
  for (const [key, value] of Object.entries(over.fields ?? {}))
    fields[key] = { ...fields[key], ...value }

  return {
    layout: over.layout ?? base.layout,
    fields,
    defaults: { ...base.defaults, ...over.defaults },
    order: over.order ?? base.order,
    hidden: [...new Set([...(base.hidden ?? []), ...(over.hidden ?? [])])],
  }
}
