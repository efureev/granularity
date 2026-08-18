import type {
  GrSchemaArrayNode,
  GrSchemaNode,
  GrSchemaObjectNode,
  GrSchemaScalarNode,
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

export function root(fields: GrSchemaNode[]): GrSchemaObjectNode {
  return object('', fields, { path: '', required: true })
}
