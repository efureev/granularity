/**
 * Правила генератора `web-types.json`, вынесенные из самого генератора: на
 * зелёной сборке ни одно из них не видно, и ошибись любое — файл молча
 * потерял бы часть пакета.
 */

const COMPONENT_EXPORT = /^\.\/components\/(Gr[A-Za-z0-9]+)$/
const ENTRY_DIR = /^\.\/dist\/components\/(Gr[A-Za-z0-9]+)\/index\.js$/

/**
 * Состав — из `package.json#exports`, а не из директорий `src/components`.
 *
 * Подкомпонент живёт в директории владельца (`GrDropdownMenu/GrDropdownMenuItem.vue`),
 * и обход по шаблону `GrX/GrX.vue` его не видит. `owner` — директория, из
 * которой собран entry подпути.
 */
export function componentEntries(exportsMap) {
  return Object.entries(exportsMap ?? {})
    .map(([path, target]) => {
      const name = COMPONENT_EXPORT.exec(path)?.[1]
      const entry = typeof target === 'string' ? target : target?.import
      const owner = ENTRY_DIR.exec(entry ?? '')?.[1]

      return name && owner ? { name, owner } : undefined
    })
    .filter(Boolean)
    .sort((left, right) => (left.name < right.name ? -1 : 1))
}

const KEYWORDS = new Set(['undefined', 'null', 'string', 'number', 'boolean', 'true', 'false', 'bigint', 'symbol', 'object', 'any', 'unknown', 'never'])
const LITERAL = /^(?:"(?:[^"\\]|\\.)*"|-?\d+(?:\.\d+)?)$/

/**
 * Тип пропа с литеральным перечнем за алиасом раскрывается.
 *
 * `GrButtonVariant | undefined` не говорит ни IDE, ни модели, какие значения
 * допустимы, а `schema` от `vue-component-meta` их уже перечисляет. Раскрывается
 * только перечень из литералов и примитивов: у дженерика, функции или объекта
 * исходная запись информативнее развёрнутой.
 */
export function expandPropType(type, schema) {
  if (!type || schema?.kind !== 'enum' || !Array.isArray(schema.schema))
    return type

  const members = schema.schema

  if (!members.every(member => typeof member === 'string' && (KEYWORDS.has(member) || LITERAL.test(member))))
    return type

  const identifiers = type.replace(/"(?:[^"\\]|\\.)*"/g, '').match(/[A-Z_$][\w$]*/gi) ?? []

  if (identifiers.every(identifier => KEYWORDS.has(identifier)))
    return type

  const has = member => members.includes(member)
  const ordered = [
    ...members.filter(member => LITERAL.test(member)),
    ...members.filter(member => KEYWORDS.has(member) && !['undefined', 'null', 'true', 'false'].includes(member)),
    ...(has('true') && has('false') ? ['boolean'] : members.filter(member => member === 'true' || member === 'false')),
    ...(has('null') ? ['null'] : []),
    ...(has('undefined') ? ['undefined'] : []),
  ]

  return [...new Set(ordered)].join(' | ')
}
