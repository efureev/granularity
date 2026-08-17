import { describe, expect, it } from 'vitest'

import {
  branchPaths,
  jsonToNodes,
  pathsToDepth,
  CIRCULAR_MARKER,
  type GrJsonNode,
} from '../jsonToNodes'

/** Узел по адресу — тесты читаются адресами, а не индексами в массиве. */
function at(nodes: GrJsonNode[], path: string): GrJsonNode {
  for (const node of nodes) {
    if (node.path === path) return node

    if (node.children) {
      const found = tryAt(node.children, path)
      if (found) return found
    }
  }

  throw new Error(`узла ${path} нет`)
}

function tryAt(nodes: GrJsonNode[], path: string): GrJsonNode | undefined {
  for (const node of nodes) {
    if (node.path === path) return node

    const found = node.children && tryAt(node.children, path)
    if (found) return found
  }

  return undefined
}

describe('jsonToNodes — структура', () => {
  it('объект и массив дают ветки, скаляры — листья', () => {
    const nodes = jsonToNodes({ name: 'Иван', tags: ['a', 'b'] })

    expect(at(nodes, '$').isLeaf).toBe(false)
    expect(at(nodes, '$.name').isLeaf).toBe(true)
    expect(at(nodes, '$.tags').kind).toBe('array')
    expect(at(nodes, '$.tags[0]').preview).toBe('"a"')
  })

  // Ветка без детей рисует стрелку, которая ничего не делает.
  it('пустые объект и массив — листья со своим превью', () => {
    const nodes = jsonToNodes({ meta: {}, items: [] })

    expect(at(nodes, '$.meta')).toMatchObject({ isLeaf: true, preview: '{}' })
    expect(at(nodes, '$.items')).toMatchObject({ isLeaf: true, preview: '[]' })
  })

  it('ветка показывает счётчик, а не содержимое', () => {
    const nodes = jsonToNodes({ a: 1, b: 2, c: [1, 2, 3] })

    expect(at(nodes, '$').preview).toBe('{3}')
    expect(at(nodes, '$.c').preview).toBe('[3]')
  })

  // «Ключа нет» и «значение null» — разные утверждения.
  it('null даёт узел, отсутствующий ключ — не даёт', () => {
    const nodes = jsonToNodes({ finished_at: null })

    expect(at(nodes, '$.finished_at').kind).toBe('null')
    expect(at(nodes, '$.finished_at').preview).toBe('null')
    expect(tryAt(nodes, '$.missing')).toBeUndefined()
  })

  it('скаляр на входе тоже даёт корневой узел', () => {
    const nodes = jsonToNodes(42)

    expect(nodes).toHaveLength(1)
    expect(nodes[0]).toMatchObject({ path: '$', kind: 'number', preview: '42', isLeaf: true })
  })
})

describe('jsonToNodes — значения, которых в JSON не бывает', () => {
  it('BigInt печатается суффиксом, а не роняет разбор', () => {
    const nodes = jsonToNodes({ id: 9007199254740993n })

    expect(at(nodes, '$.id').preview).toBe('9007199254740993n')
  })

  it.each([
    ['функция', () => undefined],
    ['символ', Symbol('s')],
    ['undefined', undefined],
  ])('%s не роняет обход', (_name, value) => {
    const nodes = jsonToNodes({ field: value })

    expect(at(nodes, '$.field').kind).toBe('unsupported')
  })
})

describe('jsonToNodes — обрезка', () => {
  // Настоящий случай: запрос к модели с картинкой в base64 — один лист на
  // сотни тысяч символов.
  it('длинная строка обрезается в показе, но не в значении', () => {
    const long = 'x'.repeat(5000)
    const nodes = jsonToNodes({ image: long }, { maxStringLength: 20 })
    const node = at(nodes, '$.image')

    expect(node.truncated).toBe(true)
    expect(node.preview.length).toBeLessThan(40)
    expect(node.value).toBe(long)
  })

  it('короткая строка не помечается обрезанной', () => {
    const nodes = jsonToNodes({ name: 'Иван' }, { maxStringLength: 20 })

    expect(at(nodes, '$.name')).toMatchObject({ truncated: false, preview: '"Иван"' })
  })

  it('длинный массив обрывается заглушкой с числом остатка', () => {
    const nodes = jsonToNodes({ items: Array.from({ length: 500 }, (_, i) => i) }, { maxArrayItems: 3 })
    const items = at(nodes, '$.items')

    expect(items.children).toHaveLength(4)
    expect(items.children!.at(-1)).toMatchObject({ kind: 'truncation', preview: '497', isLeaf: true })
    // Счётчик ветки показывает настоящую длину, а не обрезанную.
    expect(items.preview).toBe('[500]')
  })

  it('объект не обрезается по maxArrayItems — у него нет порядка', () => {
    const wide = Object.fromEntries(Array.from({ length: 50 }, (_, i) => [`k${i}`, i]))
    const nodes = jsonToNodes(wide, { maxArrayItems: 3 })

    expect(at(nodes, '$').children).toHaveLength(50)
  })
})

describe('jsonToNodes — циклы', () => {
  it('настоящий цикл помечается маркером и не зацикливает обход', () => {
    const node: Record<string, unknown> = { name: 'корень' }
    node.self = node

    const nodes = jsonToNodes(node)

    expect(at(nodes, '$.self')).toMatchObject({ preview: CIRCULAR_MARKER, isLeaf: true })
  })

  /**
   * Ровно то, чего не умеет `serializeCode`: у `replacer` нет стека предков, и
   * он метит `[Circular]` любую повторную ссылку. Обход дерева стек имеет.
   */
  it('объект, положенный в данные дважды, рисуется нормально', () => {
    const shared = { id: 1 }
    const nodes = jsonToNodes({ left: shared, right: shared })

    expect(at(nodes, '$.left').preview).not.toBe(CIRCULAR_MARKER)
    expect(at(nodes, '$.right').preview).not.toBe(CIRCULAR_MARKER)
    expect(at(nodes, '$.right.id').preview).toBe('1')
  })

  it('цикл через массив тоже ловится', () => {
    const list: unknown[] = [1]
    list.push(list)

    const nodes = jsonToNodes(list)

    expect(at(nodes, '$[1]').preview).toBe(CIRCULAR_MARKER)
  })
})

describe('jsonToNodes — адреса', () => {
  it('ключ с точкой и пробелом экранируется, иначе адрес перестаёт быть адресом', () => {
    const nodes = jsonToNodes({ 'a.b': { 'c d': 1 } })

    expect(tryAt(nodes, '$["a.b"]')).toBeDefined()
    expect(tryAt(nodes, '$["a.b"]["c d"]')).toBeDefined()
  })

  it('индекс массива идёт скобкой', () => {
    const nodes = jsonToNodes({ items: [{ name: 'a' }] })

    expect(tryAt(nodes, '$.items[0].name')).toBeDefined()
  })

  it('подпись корня настраивается', () => {
    const nodes = jsonToNodes({ a: 1 }, { rootLabel: 'response' })

    expect(nodes[0].label).toBe('response')
  })
})

describe('пути для раскрытия', () => {
  const nodes = jsonToNodes({ a: { b: { c: 1 } }, d: [1, 2] })

  it('pathsToDepth отдаёт только ветки до заданной глубины', () => {
    expect(pathsToDepth(nodes, 1)).toEqual(['$'])
    expect(pathsToDepth(nodes, 2)).toEqual(['$', '$.a', '$.d'])
  })

  it('нулевая глубина не раскрывает ничего', () => {
    expect(pathsToDepth(nodes, 0)).toEqual([])
  })

  it('branchPaths отдаёт все ветки и ни одного листа', () => {
    expect(branchPaths(nodes)).toEqual(['$', '$.a', '$.a.b', '$.d'])
  })
})
