import type {
  GrSchemaArrayNode,
  GrSchemaNode,
  GrSchemaObjectNode,
  GrSchemaScalarNode,
  GrSchemaUnionNode,
} from './types'

export function isSchemaObjectNode(node: GrSchemaNode): node is GrSchemaObjectNode {
  return node.kind === 'object'
}

export function isSchemaArrayNode(node: GrSchemaNode): node is GrSchemaArrayNode {
  return node.kind === 'array'
}

export function isSchemaUnionNode(node: GrSchemaNode): node is GrSchemaUnionNode {
  return node.kind === 'union'
}

/** Лист — то, что рисуется контролом, а не секцией или повторителем. */
export function isSchemaLeafNode(node: GrSchemaNode): node is GrSchemaScalarNode {
  return node.kind !== 'object' && node.kind !== 'array' && node.kind !== 'union'
}

/** Узел рисуется выбором из готовых вариантов, а не свободным вводом. */
export function isSchemaChoiceNode(node: GrSchemaNode): boolean {
  return Array.isArray(node.options) && node.options.length > 0
}
