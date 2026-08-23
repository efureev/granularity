/**
 * Подмножество JSON Schema, которое читает адаптер.
 *
 * Объявлено своим типом, а не взято из `@types/json-schema`: пакет не имеет
 * зависимостей, а нужна отсюда лишь форма документа. Незнакомые ключи
 * сохраняются — по ним работают аннотации `x-*`.
 */
export interface JsonSchemaDocument {
  $schema?: string
  $id?: string
  $ref?: string
  $defs?: Record<string, JsonSchemaDocument>
  definitions?: Record<string, JsonSchemaDocument>

  type?: JsonSchemaType | JsonSchemaType[]
  title?: string
  description?: string
  default?: unknown
  const?: unknown
  enum?: unknown[]
  examples?: unknown[]
  format?: string
  readOnly?: boolean
  writeOnly?: boolean
  deprecated?: boolean
  /** OpenAPI 3.0: до `type: [x, 'null']` там не додумались. */
  nullable?: boolean

  properties?: Record<string, JsonSchemaDocument>
  required?: string[]
  additionalProperties?: boolean | JsonSchemaDocument

  items?: JsonSchemaDocument
  prefixItems?: JsonSchemaDocument[]
  minItems?: number
  maxItems?: number
  uniqueItems?: boolean

  minLength?: number
  maxLength?: number
  pattern?: string

  minimum?: number
  maximum?: number
  exclusiveMinimum?: number | boolean
  exclusiveMaximum?: number | boolean
  multipleOf?: number

  oneOf?: JsonSchemaDocument[]
  anyOf?: JsonSchemaDocument[]
  allOf?: JsonSchemaDocument[]
  not?: JsonSchemaDocument
  if?: JsonSchemaDocument
  then?: JsonSchemaDocument
  else?: JsonSchemaDocument

  discriminator?: { propertyName: string, mapping?: Record<string, string> }

  /** `errorMessage` из ajv-errors и одноимённого расширения. */
  errorMessage?: string | Record<string, string>

  [key: string]: unknown
}

export type JsonSchemaType
  = | 'string' | 'number' | 'integer' | 'boolean' | 'object' | 'array' | 'null'
