import { getAtPath, joinPath, setAtPath } from './paths'
import { isResolvedUnion } from './union'
import type { GrSchemaNode, GrSchemaObjectNode } from './types'

function cloneDefault(value: unknown): unknown {
  if (value === null || typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map(cloneDefault)
  if (value instanceof Date) return new Date(value.getTime())

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, cloneDefault(item)]),
  )
}

/**
 * Начальное значение узла.
 *
 * Таблица выбрана не по вкусу, а по тому, как ядро считает поле пустым
 * (`isEmpty`: `null`, `undefined`, пустая строка, пустой массив — да; `0` и
 * `false` — нет):
 *
 * - число — `null`, а не `0`: иначе `required` прошёл бы на нетронутом поле;
 * - строка — `''`: поле остаётся управляемым, и `required` работает;
 * - булев — `false`: чекбоксу нужен булев, а «обязан быть истинным» выражается
 *   отдельной проверкой, а не `required`;
 * - массив — `[]` **обязательно заранее**: писатель ядра создал бы объект;
 * - что угодно неизвестное — `null`, но никогда `undefined`: снимок модели
 *   выбрасывает `undefined`-ключи, и сброс формы затем удалил бы ключ вовсе.
 */
export function defaultValueFor(node: GrSchemaNode): unknown {
  if (node.default !== undefined) return cloneDefault(node.default)
  if (node.const !== undefined) return cloneDefault(node.const)

  switch (node.kind) {
    case 'string':
      return node.options && node.options.length > 0 ? null : ''
    case 'number':
      return null
    case 'boolean':
      return false
    case 'date':
      return null
    case 'file':
      return null
    case 'array':
      return []
    case 'object':
      return emptyObjectFor(node)
    case 'union':
      // Первый вариант, а не `null`: иначе `expand` уходит по «значения нет»,
      // и объединение не показывает ни одного поля, пока значение не проставят
      // снаружи. Форма, которую нельзя починить изнутри, — не форма.
      return isResolvedUnion(node) ? emptyObjectFor(node.variants[0]!) : null
    case 'unknown':
      return null
  }
}

function emptyObjectFor(node: GrSchemaObjectNode): Record<string, unknown> {
  const value: Record<string, unknown> = {}
  for (const field of node.fields) value[field.key] = defaultValueFor(field)

  return value
}

/** Начальная модель по корню схемы. */
export function emptyModelFor(root: GrSchemaObjectNode): Record<string, unknown> {
  return emptyObjectFor(root)
}

/**
 * Начальная модель поверх существующих данных.
 *
 * Существующее значение всегда сильнее умолчания, а ключи, которых схема не
 * знает, **сохраняются**: в модели редактируемой сущности лежат `id`,
 * `createdAt` и служебные поля стора, и генератор не вправе их выбрасывать.
 */
export function createInitialModel(
  root: GrSchemaObjectNode,
  existing?: Record<string, unknown>,
): Record<string, unknown> {
  const model: Record<string, unknown> = { ...(existing ?? {}) }

  for (const field of root.fields) {
    const current = model[field.key]
    if (current === undefined) {
      model[field.key] = defaultValueFor(field)
      continue
    }

    if (field.kind === 'object' && current !== null && typeof current === 'object' && !Array.isArray(current))
      model[field.key] = createInitialModel(field, current as Record<string, unknown>)
  }

  return model
}

/** Новая строка повторителя — по узлу элемента массива. */
export function createInitialItem(node: GrSchemaNode): unknown {
  return defaultValueFor(node)
}

/** Путь поля внутри строки: `items` + 2 + `name` → `items.2.name`. */
export function itemFieldPath(arrayPath: string, index: number, key: string): string {
  return joinPath(arrayPath, index, key)
}

/**
 * Приводит модель к форме схемы: контейнеры существуют, листья заполнены.
 *
 * Зовётся до первого снимка формы, и делает два разных дела по одной причине.
 * Контейнеры нужны потому, что писатель ядра создаёт промежуточные узлы
 * объектами, и путь `items.0.name` превратил бы отсутствующий массив в
 * `{ '0': … }`. Листья — потому что строка, пришедшая с сервера без поля,
 * отдала бы контролу `undefined`, а контрол с `undefined` вместо значения
 * ведёт себя неуправляемым.
 */
export function ensureShape(target: Record<string, unknown>, root: GrSchemaObjectNode): void {
  const visit = (node: GrSchemaNode, base: string): void => {
    if (node.kind === 'object') {
      for (const field of node.fields) {
        const path = joinPath(base, field.key)
        const existing = getAtPath(target, path)

        if (field.kind === 'array') {
          if (!Array.isArray(existing)) setAtPath(target, path, [])
        }
        else if (field.kind === 'object') {
          const isPlainObject = existing !== null && typeof existing === 'object' && !Array.isArray(existing)
          if (!isPlainObject) setAtPath(target, path, {})
        }
        else if (existing === undefined) {
          setAtPath(target, path, defaultValueFor(field))
        }

        visit(field, path)
      }
      return
    }

    if (node.kind === 'array') {
      const list = getAtPath(target, base)
      if (!Array.isArray(list)) return

      // Строки, уже лежащие в модели, тоже обязаны иметь форму схемы.
      for (let index = 0; index < list.length; index += 1) visit(node.item, joinPath(base, index))
    }
  }

  visit(root, '')
}
