import { isSchemaArrayNode, isSchemaLeafNode, isSchemaObjectNode, isSchemaUnionNode } from './guards'
import { unionVariantFor } from './union'
import { getAtPath, joinPath } from './paths'
import type { GrSchemaFieldInstance, GrSchemaNode, GrSchemaObjectNode } from './types'

export interface ExpandFieldsOptions {
  /** Отбор узлов: скрытые `uiSchema` поля не разворачиваются вовсе. */
  include?: (node: GrSchemaNode, name: string) => boolean
  /** Не заходить глубже — защита от рекурсивных схем. */
  maxDepth?: number
}

/**
 * Разворачивает дерево схемы в плоский список полей по конкретным данным.
 *
 * Чистая функция без Vue: на ней тестируются и компилятор правил, и раскладка,
 * без единого монтирования. Массивы разворачиваются по **фактической** длине
 * значения — узел элемента один, а полей столько, сколько строк в модели.
 */
export function expandFields(
  root: GrSchemaObjectNode,
  value: unknown,
  options: ExpandFieldsOptions = {},
): GrSchemaFieldInstance[] {
  const maxDepth = options.maxDepth ?? 24
  const result: GrSchemaFieldInstance[] = []

  const visit = (
    node: GrSchemaNode,
    name: string,
    templatePath: string,
    indices: number[],
    parent: string,
    depth: number,
  ): void => {
    if (depth > maxDepth)
      return
    if (options.include && !options.include(node, name))
      return

    const instance: GrSchemaFieldInstance = {
      node,
      name,
      templatePath,
      indices,
      parent,
      depth,
      leaf: isSchemaLeafNode(node),
    }

    result.push(instance)

    if (isSchemaObjectNode(node)) {
      for (const field of node.fields) {
        visit(
          field,
          joinPath(name, field.key),
          joinPath(templatePath, field.key),
          indices,
          name,
          depth + 1,
        )
      }
      return
    }

    if (isSchemaArrayNode(node)) {
      const list = getAtPath(value, name)
      if (!Array.isArray(list))
        return

      for (let index = 0; index < list.length; index += 1) {
        visit(
          node.item,
          joinPath(name, index),
          joinPath(templatePath, '*'),
          [...indices, index],
          name,
          depth + 1,
        )
      }
      return
    }

    if (isSchemaUnionNode(node)) {
      // Ветка выбирается по значению дискриминатора: разворачивать все варианты
      // значило бы объявить формой поля, которых на экране нет.
      const current = getAtPath(value, name)
      const discriminator = node.discriminator
      if (!discriminator || current === null || typeof current !== 'object')
        return

      const variant = unionVariantFor(node, (current as Record<string, unknown>)[discriminator])

      if (!variant)
        return

      // Раскрываются **поля** варианта, а не он сам: инстанс варианта нёс бы то
      // же имя, что и объединение, и список полей контейнера содержал бы два
      // узла под одним ключом. Родитель у них — само объединение, поэтому оно
      // и спрашивает их у контекста.
      for (const field of variant.fields) {
        visit(
          field,
          joinPath(name, field.key),
          joinPath(templatePath, field.key),
          indices,
          name,
          depth + 1,
        )
      }
    }
  }

  for (const field of root.fields)
    visit(field, field.key, field.key, [], '', 0)

  return result
}

/** Только листья — то, что реально становится полем формы. */
export function expandLeafFields(
  root: GrSchemaObjectNode,
  value: unknown,
  options?: ExpandFieldsOptions,
): GrSchemaFieldInstance[] {
  return expandFields(root, value, options).filter(instance => instance.leaf)
}
