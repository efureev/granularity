/**
 * Разбор произвольного значения в узлы дерева.
 *
 * Компонент показывает данные из БД и от чужих сервисов, поэтому обход обязан
 * пережить всё: цикл, `BigInt`, функцию в поле, массив на десять тысяч записей,
 * строку в миллион символов. Уронить страницу он права не имеет.
 */

/** Что за значение в узле. Решает и цвет, и то, раскрывается ли узел. */
export type GrJsonNodeKind
  = | 'object'
    | 'array'
    | 'string'
    | 'number'
    | 'boolean'
    | 'null'
  /** Значения, которых в JSON не бывает: функция, символ, `undefined`. */
    | 'unsupported'
  /** Хвост обрезанного массива — «ещё N элементов». Своего значения не имеет. */
    | 'truncation'

export type GrJsonNode = {
  /** Читаемый адрес узла (`$.items[3].name`). Он же ключ для `GrTree`. */
  path: string
  /** Имя ключа или индекс. Показывается слева от двоеточия. */
  label: string
  kind: GrJsonNodeKind
  /** Что видно в строке. У ветки — счётчик, у листа — значение, возможно обрезанное. */
  preview: string
  /** Полное значение. Копирование берёт его, а не `preview`. */
  value: unknown
  /** Показ обрезан: копирование всё равно отдаёт целое. */
  truncated: boolean
  isLeaf: boolean
  children?: GrJsonNode[]
}

export type GrJsonToNodesOptions = {
  /** Подпись корня. */
  rootLabel?: string
  /** Длина строки, после которой значение обрезается в показе. */
  maxStringLength?: number
  /** Сколько элементов массива разбирать до заглушки «ещё N». */
  maxArrayItems?: number
}

/** Маркер ветки, которая уже встречалась выше по этой же цепочке предков. */
export const CIRCULAR_MARKER = '[Circular]'

const DEFAULT_ROOT_LABEL = '$'
const DEFAULT_MAX_STRING_LENGTH = 200
const DEFAULT_MAX_ARRAY_ITEMS = 100

/** Ключ, который можно дописать через точку, не сломав адрес. */
const PLAIN_KEY = /^[A-Za-z_$][\w$]*$/

function appendKey(parentPath: string, key: string): string {
  return PLAIN_KEY.test(key) ? `${parentPath}.${key}` : `${parentPath}[${JSON.stringify(key)}]`
}

/**
 * Счётчик у ветки вместо её содержимого: свёрнутый узел обязан сказать, стоит
 * ли его раскрывать. Слово не склоняется — компонент не знает языка потребителя,
 * а число само по себе читается в любом.
 */
function branchPreview(kind: 'object' | 'array', count: number): string {
  return kind === 'array' ? `[${count}]` : `{${count}}`
}

function scalarPreview(value: unknown, maxStringLength: number): { preview: string, truncated: boolean } {
  if (typeof value === 'string') {
    if (value.length <= maxStringLength)
      return { preview: JSON.stringify(value), truncated: false }

    // Кавычка открывается и не закрывается намеренно: закрытая читалась бы как
    // конец строки, а строка продолжается — её просто не показывают целиком.
    return { preview: `${JSON.stringify(value.slice(0, maxStringLength))}…`, truncated: true }
  }

  // `BigInt` представления в JSON не имеет, и `JSON.stringify` на нём бросает.
  if (typeof value === 'bigint')
    return { preview: `${value}n`, truncated: false }

  if (typeof value === 'function' || typeof value === 'symbol' || value === undefined)
    return { preview: String(value), truncated: false }

  return { preview: JSON.stringify(value) ?? String(value), truncated: false }
}

function kindOf(value: unknown): GrJsonNodeKind {
  if (value === null)
    return 'null'
  if (Array.isArray(value))
    return 'array'

  switch (typeof value) {
    case 'string': return 'string'
    case 'number': return 'number'
    case 'bigint': return 'number'
    case 'boolean': return 'boolean'
    case 'object': return 'object'
    // `undefined`, функция и символ представления в JSON не имеют — узел
    // остаётся, чтобы ключ не исчез из показа молча.
    case 'undefined':
    case 'function':
    case 'symbol': return 'unsupported'
  }

  // Недостижимо: ветки выше покрывают `typeof` целиком. Оставлено ради вывода
  // типов — без него TS не считает функцию всегда возвращающей.
  return 'unsupported'
}

type BuildContext = {
  maxStringLength: number
  maxArrayItems: number
  /**
   * Цепочка предков текущего узла, а не все встреченные объекты.
   *
   * Разница принципиальна и отличает обход дерева от `replacer` у
   * `JSON.stringify`: тому стек недоступен, поэтому он метит `[Circular]` любую
   * повторную ссылку — в том числе объект, честно положенный в данные дважды.
   * Здесь стек есть, и маркер достаётся только настоящему циклу.
   */
  ancestors: Set<object>
}

function buildNode(label: string, path: string, value: unknown, context: BuildContext): GrJsonNode {
  const kind = kindOf(value)

  if (kind !== 'object' && kind !== 'array') {
    const { preview, truncated } = scalarPreview(value, context.maxStringLength)

    return { path, label, kind, preview, value, truncated, isLeaf: true }
  }

  const container = value as object

  if (context.ancestors.has(container)) {
    return { path, label, kind, preview: CIRCULAR_MARKER, value, truncated: false, isLeaf: true }
  }

  const entries = Array.isArray(value)
    ? value.map((item, index) => [String(index), item] as const)
    : Object.entries(container)

  // Пустой объект и пустой массив — листья: раскрывать нечего, а ветка без
  // детей рисует стрелку, которая ничего не делает.
  if (entries.length === 0) {
    return {
      path,
      label,
      kind,
      preview: Array.isArray(value) ? '[]' : '{}',
      value,
      truncated: false,
      isLeaf: true,
    }
  }

  context.ancestors.add(container)

  const limit = Math.max(0, context.maxArrayItems)
  const isOverLimit = Array.isArray(value) && entries.length > limit
  const visible = isOverLimit ? entries.slice(0, limit) : entries

  const children: GrJsonNode[] = visible.map(([key, item]) => buildNode(
    key,
    Array.isArray(value) ? `${path}[${key}]` : appendKey(path, key),
    item,
    context,
  ))

  if (isOverLimit) {
    const rest = entries.length - limit

    children.push({
      path: `${path}[…]`,
      label: '…',
      kind: 'truncation',
      preview: String(rest),
      value: (value as unknown[]).slice(limit),
      truncated: true,
      isLeaf: true,
    })
  }

  context.ancestors.delete(container)

  return {
    path,
    label,
    kind,
    preview: branchPreview(kind, entries.length),
    value,
    truncated: isOverLimit,
    isLeaf: false,
    children,
  }
}

/**
 * Значение → узлы дерева. Корень всегда один: даже скаляр на входе — это узел,
 * иначе дерево пришлось бы то показывать, то нет.
 */
export function jsonToNodes(value: unknown, options: GrJsonToNodesOptions = {}): GrJsonNode[] {
  const context: BuildContext = {
    maxStringLength: options.maxStringLength ?? DEFAULT_MAX_STRING_LENGTH,
    maxArrayItems: options.maxArrayItems ?? DEFAULT_MAX_ARRAY_ITEMS,
    ancestors: new Set(),
  }

  return [buildNode(options.rootLabel ?? DEFAULT_ROOT_LABEL, DEFAULT_ROOT_LABEL, value, context)]
}

/** Пути всех узлов до заданной глубины — ими задаётся начальная свёртка. */
export function pathsToDepth(nodes: GrJsonNode[], depth: number, level = 0): string[] {
  if (level >= depth)
    return []

  return nodes.flatMap(node => (
    node.children ? [node.path, ...pathsToDepth(node.children, depth, level + 1)] : []
  ))
}

/** Пути всех веток — для «раскрыть всё». */
export function branchPaths(nodes: GrJsonNode[]): string[] {
  return nodes.flatMap(node => (node.children ? [node.path, ...branchPaths(node.children)] : []))
}
