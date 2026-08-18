import type { Component, InjectionKey } from 'vue'
import { getCurrentInstance, inject, provide } from 'vue'

import type { GrSchemaFormat, GrSchemaKind, GrSchemaNode } from '../model'
import { isSchemaArrayNode } from '../model'

/**
 * Декларативный матчер записи.
 *
 * Матч объявляется данными, а не функцией, потому что реестр читают не только
 * машиной: «почему это поле стало текстовым» — первый вопрос к генератору
 * форм, и ответ должен читаться в отладке, а не выводиться из кода замыкания.
 */
export interface GrSchemaRendererMatch {
  kind?: GrSchemaKind | GrSchemaKind[]
  format?: GrSchemaFormat | GrSchemaFormat[]
  /** Есть ли у узла готовые варианты выбора. */
  enum?: boolean
  /** Только для массива: вид элемента. */
  itemKind?: GrSchemaKind | GrSchemaKind[]
  /** Только для массива: есть ли варианты у элемента. */
  itemEnum?: boolean
  /** Порог по `constraints.max` — «строка длиннее 160 знаков это уже textarea». */
  maxAbove?: number
  maxAtMost?: number
  optionsAtMost?: number
  optionsAbove?: number
  /** Есть и нижняя, и верхняя граница — без обеих ползунок бессмыслен. */
  bounded?: boolean
  /** Ключ присутствует в `node.annotations`. */
  annotation?: string
}

export interface GrSchemaRendererContext {
  node: GrSchemaNode
  /** Инстанс-путь: `items.0.price`. */
  name: string
  /** Шаблонный путь: `items.*.price`. */
  templatePath: string
  index?: number
  t: (key: string, fallback: string, params?: Record<string, unknown>) => string
}

/**
 * Перевод значения между моделью и контролом.
 *
 * Нужен там, где типы не совпадают: модель хранит `null`, а `GrInput` ждёт
 * строку; схема просит ISO-строку, а пикер отдаёт `Date`.
 */
export interface GrSchemaValueCodec {
  toControl: (value: unknown, node: GrSchemaNode) => unknown
  toModel: (value: unknown, node: GrSchemaNode) => unknown
}

export interface GrSchemaRenderer {
  /** Уникальное имя: по нему работают `uiSchema.widget` и `override()`. */
  name: string
  component: Component
  when?: GrSchemaRendererMatch
  /** Условие сверх декларативного — соединяется через «и». */
  match?: (node: GrSchemaNode) => boolean
  /** Пропы контрола из узла. `modelValue` подставляет поле. */
  props?: (ctx: GrSchemaRendererContext) => Record<string, unknown>
  codec?: GrSchemaValueCodec
  /** Больше — раньше. Дефолтные записи занимают 0…90. */
  priority?: number
  /** Что запись рисует — для safelist пакета и доки. */
  components?: string[]
}

export interface GrSchemaRendererRegistry {
  register: (...renderers: GrSchemaRenderer[]) => GrSchemaRendererRegistry
  /** Точечная подмена дефолтной записи. */
  override: (name: string, patch: Partial<GrSchemaRenderer>) => GrSchemaRendererRegistry
  remove: (name: string) => GrSchemaRendererRegistry
  resolve: (node: GrSchemaNode, widget?: string) => GrSchemaRenderer | undefined
  entries: () => readonly GrSchemaRenderer[]
  /** Изолированная копия: две формы на странице вправе иметь разные наборы. */
  fork: () => GrSchemaRendererRegistry
}

function toArray<T>(value: T | T[] | undefined): T[] | undefined {
  if (value === undefined) return undefined
  return Array.isArray(value) ? value : [value]
}

function matchesDeclarative(node: GrSchemaNode, when: GrSchemaRendererMatch): boolean {
  const kinds = toArray(when.kind)
  if (kinds && !kinds.includes(node.kind)) return false

  const formats = toArray(when.format)
  if (formats && (!node.format || !formats.includes(node.format))) return false

  const optionCount = node.options?.length ?? 0
  if (when.enum !== undefined && (optionCount > 0) !== when.enum) return false
  if (when.optionsAtMost !== undefined && (optionCount === 0 || optionCount > when.optionsAtMost)) return false
  if (when.optionsAbove !== undefined && optionCount <= when.optionsAbove) return false

  if (when.itemKind !== undefined || when.itemEnum !== undefined) {
    if (!isSchemaArrayNode(node)) return false

    const itemKinds = toArray(when.itemKind)
    if (itemKinds && !itemKinds.includes(node.item.kind)) return false

    const itemOptions = node.item.options?.length ?? 0
    if (when.itemEnum !== undefined && (itemOptions > 0) !== when.itemEnum) return false
  }

  const { max, min } = node.constraints
  if (when.maxAbove !== undefined && (max === undefined || max <= when.maxAbove)) return false
  if (when.maxAtMost !== undefined && (max === undefined || max > when.maxAtMost)) return false
  if (when.bounded === true && (min === undefined || max === undefined)) return false

  if (when.annotation !== undefined && !(node.annotations && when.annotation in node.annotations)) return false

  return true
}

export function createSchemaRendererRegistry(
  base: readonly GrSchemaRenderer[] = [],
): GrSchemaRendererRegistry {
  const entries: GrSchemaRenderer[] = [...base]

  const sorted = (): GrSchemaRenderer[] =>
    [...entries].sort((left, right) => (right.priority ?? 0) - (left.priority ?? 0))

  const registry: GrSchemaRendererRegistry = {
    register(...renderers) {
      for (const renderer of renderers) {
        const index = entries.findIndex(entry => entry.name === renderer.name)
        // Своя запись по умолчанию сильнее дефолтной: потребитель регистрирует
        // её после, и ждёт, что она победит, а не встанет в хвост.
        const withPriority = { priority: 1000, ...renderer }
        if (index === -1) entries.push(withPriority)
        else entries[index] = withPriority
      }
      return registry
    },

    override(name, patch) {
      const index = entries.findIndex(entry => entry.name === name)
      if (index !== -1) entries[index] = { ...entries[index]!, ...patch }
      return registry
    },

    remove(name) {
      const index = entries.findIndex(entry => entry.name === name)
      if (index !== -1) entries.splice(index, 1)
      return registry
    },

    resolve(node, widget) {
      // Явно названный виджет игнорирует условия: потребитель уже решил.
      if (widget) return entries.find(entry => entry.name === widget)

      return sorted().find(entry =>
        (!entry.when || matchesDeclarative(node, entry.when))
        && (!entry.match || entry.match(node)))
    },

    entries: () => sorted(),
    fork: () => createSchemaRendererRegistry(entries),
  }

  return registry
}

export const GR_SCHEMA_RENDERERS: InjectionKey<GrSchemaRendererRegistry> = Symbol('grSchemaRenderers')

export function provideSchemaRenderers(registry: GrSchemaRendererRegistry): void {
  provide(GR_SCHEMA_RENDERERS, registry)
}

export function useSchemaRenderers(fallback?: GrSchemaRendererRegistry): GrSchemaRendererRegistry | undefined {
  return getCurrentInstance() ? inject(GR_SCHEMA_RENDERERS, fallback) : fallback
}
