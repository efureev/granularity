import type {
  GrSchemaArrayNode,
  GrSchemaNode,
  GrSchemaObjectNode,
  GrSchemaScalarNode,
  GrSchemaUnionNode,
} from '../types'

/**
 * Фабрики узлов для тестов.
 *
 * Узел модели — плоская запись из полутора десятков полей, и без фабрик каждый
 * тест утонул бы в литералах, за которыми не видно предмета проверки.
 */
const base = {
  required: false,
  nullable: false,
  readOnly: false,
  writeOnly: false,
  deprecated: false,
  residual: false,
} as const

export function scalar(
  key: string,
  kind: GrSchemaScalarNode['kind'] = 'string',
  extra: Partial<GrSchemaScalarNode> = {},
): GrSchemaScalarNode {
  return { ...base, path: key, key, kind, constraints: {}, ...extra }
}

export function object(
  key: string,
  fields: GrSchemaNode[],
  extra: Partial<GrSchemaObjectNode> = {},
): GrSchemaObjectNode {
  return { ...base, path: key, key, kind: 'object', constraints: {}, additional: false, fields, ...extra }
}

export function array(
  key: string,
  item: GrSchemaNode,
  extra: Partial<GrSchemaArrayNode> = {},
): GrSchemaArrayNode {
  return { ...base, path: key, key, kind: 'array', constraints: {}, item, ...extra }
}

/** Вариант объединения: объект, у которого дискриминатор несёт `const`. */
export function variant(tag: string, fields: GrSchemaNode[], title?: string): GrSchemaObjectNode {
  return object(tag, [scalar('kind', 'string', { const: tag }), ...fields], { title })
}

export function union(
  key: string,
  variants: GrSchemaObjectNode[],
  extra: Partial<GrSchemaUnionNode> = {},
): GrSchemaUnionNode {
  return { ...base, path: key, key, kind: 'union', constraints: {}, discriminator: 'kind', variants, ...extra }
}

export function root(fields: GrSchemaNode[]): GrSchemaObjectNode {
  return object('', fields, { path: '', required: true })
}
