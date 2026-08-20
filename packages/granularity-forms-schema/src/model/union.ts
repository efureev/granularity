import { isSchemaUnionNode } from './guards'
import type { GrSchemaNode, GrSchemaObjectNode, GrSchemaUnionNode } from './types'

/**
 * Работа с дискриминированным объединением — в одном месте.
 *
 * Ветку выбирают трижды: при развороте полей (`expand`), при подстановке
 * начального значения (`defaults`) и в самом переключателе. Разойдись эти три
 * ответа хоть раз — форма покажет поля одной ветки, а отправит значения другой.
 */

/** Значение дискриминатора у варианта: оно же `const` соответствующего поля. */
export function unionTagOf(variant: GrSchemaObjectNode, discriminator: string): unknown {
  return variant.fields.find(field => field.key === discriminator)?.const
}

/** Вариант по значению дискриминатора. */
export function unionVariantFor(node: GrSchemaUnionNode, tag: unknown): GrSchemaObjectNode | undefined {
  if (!node.discriminator) return undefined

  return node.variants.find(variant => unionTagOf(variant, node.discriminator!) === tag)
}

/**
 * Вариант для переключателя веток.
 *
 * Свой тип, а не `GrSchemaOption`: у того `value` включает `boolean`, который
 * контролы выбора не принимают, а тег объединения булевым не бывает.
 */
export interface GrSchemaUnionOption {
  value: string | number
  label: string
  description?: string
}

/**
 * Варианты для переключателя.
 *
 * Подпись берётся у самого варианта, а не у значения дискриминатора: `title`
 * пишет автор схемы, а тег — это ключ протокола, и показывать пользователю
 * `courier_delivery_v2` незачем.
 */
export function unionOptions(node: GrSchemaUnionNode): GrSchemaUnionOption[] {
  if (!node.discriminator) return []

  return node.variants.flatMap((variant) => {
    const tag = unionTagOf(variant, node.discriminator!)

    // Тег — строка или число. Булев дискриминатор различал бы не больше двух
    // веток и в схемах не встречается, зато протаскивал бы `boolean` в контролы
    // выбора, которые его не принимают.
    if (typeof tag !== 'string' && typeof tag !== 'number')
      return []

    return [{ value: tag, label: variant.title ?? String(tag), description: variant.description }]
  })
}

/**
 * Разобрано ли объединение: есть дискриминатор и есть по чему выбирать.
 *
 * Неразобранное уходит в полную проверку схемой (`residual`) — форма про такой
 * узел ничего сказать не может.
 */
export function unionIsResolved(node: GrSchemaUnionNode): boolean {
  return Boolean(node.discriminator)
    && node.variants.length > 0
    && unionOptions(node).length === node.variants.length
}

export function isResolvedUnion(node: GrSchemaNode): node is GrSchemaUnionNode {
  return isSchemaUnionNode(node) && unionIsResolved(node)
}
