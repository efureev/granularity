import { effectScope, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import type { UseTreeOptions, UseTreeReturn } from '../useTree'
import { useTree } from '../useTree'

type Item = { id: string, label: string, isLeaf?: boolean, children?: Item[] }

function nodes(): Item[] {
  return [
    { id: 'ops', label: 'Операции', children: [
      { id: 'esc', label: 'Эскалации' },
      { id: 'rules', label: 'Регламенты', children: [
        { id: 'duty', label: 'Дежурства' },
        { id: 'tpl', label: 'Шаблоны' },
      ] },
    ] },
    { id: 'billing', label: 'Биллинг', children: [
      { id: 'invoices', label: 'Счета' },
    ] },
  ]
}

/**
 * Композабл вызывается ровно так, как это сделает потребитель: без компонента и
 * без адаптера. Именно это и проверяется — модель публикуется затем, чтобы на
 * ней собирали свою разметку, и требовать для неё внутреннюю фабрику значило бы
 * опубликовать невызываемый API.
 */
function setup(overrides: Partial<UseTreeOptions<Item>> = {}) {
  const scope = effectScope()
  const tree = scope.run(() => useTree<Item>({
    data: nodes(),
    nodeKey: 'id',
    ...overrides,
  }))!

  return { tree, dispose: () => scope.stop() }
}

const ids = (tree: UseTreeReturn<Item>) => tree.visibleRows.value.map(row => row.node.key)

describe('useTree: вызов без компонента', () => {
  it('строится без адаптера — он собирается из `nodeKey` и `props`', () => {
    const { tree, dispose } = setup()

    expect(ids(tree)).toEqual(['ops', 'billing'])
    dispose()
  })

  it('форма данных описывается картой полей', () => {
    type Folder = { key: string, title: string, items?: Folder[] }
    const scope = effectScope()
    const tree = scope.run(() => useTree<Folder>({
      data: [{ key: 'a', title: 'A', items: [{ key: 'b', title: 'B' }] }],
      nodeKey: 'key',
      props: { children: 'items', label: 'title' },
      defaultExpandedKeys: ['a'],
    }))!

    expect(tree.visibleRows.value.map(row => row.node.label)).toEqual(['A', 'B'])
    scope.stop()
  })
})

describe('useTree: плоский список строк', () => {
  it('несёт всё, что нужно ролям дерева', () => {
    const { tree, dispose } = setup({ defaultExpandedKeys: ['ops'] })
    const row = tree.visibleRows.value[1]

    // В плоском DOM группы нет: структуру диктору сообщают ровно эти три числа.
    expect(row.node.key).toBe('esc')
    expect(row.node.level).toBe(2)
    expect(row.posInSet).toBe(1)
    expect(row.setSize).toBe(2)
    expect(row.isLeaf).toBe(true)
    dispose()
  })

  it('раскрытие добавляет и убирает строки', () => {
    const { tree, dispose } = setup()

    expect(ids(tree)).toEqual(['ops', 'billing'])

    tree.setExpandedKey('ops', true)
    expect(ids(tree)).toEqual(['ops', 'esc', 'rules', 'billing'])

    tree.setExpandedKey('rules', true)
    expect(ids(tree)).toEqual(['ops', 'esc', 'rules', 'duty', 'tpl', 'billing'])

    tree.setExpandedKey('ops', false)
    expect(ids(tree)).toEqual(['ops', 'billing'])
    dispose()
  })

  it('следует за реактивными данными', () => {
    const data = ref<Item[]>([{ id: 'a', label: 'A' }])
    const { tree, dispose } = setup({ data: () => data.value })

    expect(ids(tree)).toEqual(['a'])

    data.value = [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }]
    expect(ids(tree)).toEqual(['a', 'b'])
    dispose()
  })

  it('направляющих модель не знает, пока не задан их цвет', () => {
    const { tree, dispose } = setup({ defaultExpandedKeys: ['ops'] })

    expect(tree.visibleRows.value[1].branchColors).toEqual([])
    dispose()
  })

  it('цвет предка копится цепочкой, когда потребитель его даёт', () => {
    const { tree, dispose } = setup({
      defaultExpandedKeys: ['ops', 'rules'],
      branchColorFor: node => `c-${String(node.key)}`,
    })
    const deep = tree.visibleRows.value.find(row => row.node.key === 'duty')!

    expect(deep.branchColors).toEqual(['c-ops', 'c-rules'])
    dispose()
  })
})

describe('useTree: отметки', () => {
  it('отмеченный родитель отмечает потомков', () => {
    const { tree, dispose } = setup()

    tree.setChecked(tree.getNode('ops')!, true)

    expect(tree.getCheckedKeys().sort()).toEqual(['duty', 'esc', 'ops', 'rules', 'tpl'])
    expect(tree.getCheckState('duty')).toBe('checked')
    dispose()
  })

  it('частично отмеченный родитель объявляется `half`', () => {
    const { tree, dispose } = setup()

    tree.setChecked(tree.getNode('duty')!, true)

    // Это и есть `aria-checked="mixed"` на самом узле: своя разметка получает
    // состояние готовым и рисует свой квадратик.
    expect(tree.getCheckState('rules')).toBe('half')
    expect(tree.getCheckState('ops')).toBe('half')
    expect(tree.getHalfCheckedKeys().sort()).toEqual(['ops', 'rules'])
    dispose()
  })

  it('`checkStrictly` связь по дереву отключает', () => {
    const { tree, dispose } = setup({ checkStrictly: true })

    tree.setChecked(tree.getNode('ops')!, true)

    expect(tree.getCheckedKeys()).toEqual(['ops'])
    expect(tree.getCheckState('esc')).toBe('unchecked')
    dispose()
  })

  it('только листья отдаются по запросу', () => {
    const { tree, dispose } = setup()

    tree.setChecked(tree.getNode('ops')!, true)

    // Родители в ответе не нужны тому, кто сохраняет выбор: они выводятся из
    // листьев, и `setCheckedKeys` их так же выводит обратно.
    expect(tree.getCheckedKeys({ leafOnly: true }).sort()).toEqual(['duty', 'esc', 'tpl'])
    dispose()
  })
})

describe('useTree: фильтр', () => {
  it('оставляет совпавшие узлы вместе с их ветками', () => {
    const { tree, dispose } = setup({
      filterNodeMethod: (value, data) => data.label.toLowerCase().includes(value.toLowerCase()),
    })

    tree.filter('дежур')

    // Родители остаются не потому, что совпали, а чтобы совпавший узел было
    // видно: иначе результат поиска висел бы без ветки.
    expect(ids(tree)).toEqual(['ops', 'rules', 'duty'])
    expect(tree.visibleRows.value.map(row => row.isMatched)).toEqual([false, false, true])
    dispose()
  })

  it('пустой запрос возвращает исходный вид', () => {
    const { tree, dispose } = setup({
      filterNodeMethod: (value, data) => data.label.includes(value),
    })

    tree.filter('Счета')
    expect(ids(tree)).toEqual(['billing', 'invoices'])

    tree.filter('')
    expect(ids(tree)).toEqual(['ops', 'billing'])
    dispose()
  })
})

describe('useTree: ленивая подгрузка', () => {
  it('грузит ветку по первому раскрытию и второй раз не запрашивает', async () => {
    const load = vi.fn((_node, resolve: (children: Item[]) => void) => {
      resolve([{ id: 'child', label: 'Ребёнок', isLeaf: true }])
    })
    const { tree, dispose } = setup({
      data: [{ id: 'root', label: 'Корень' }],
      lazy: true,
      load: load as never,
    })

    const root = tree.getNode('root')!
    expect(tree.isLeafNode(root)).toBe(false)

    tree.setExpandedKey('root', true)
    tree.ensureLoaded(root)
    expect(load).toHaveBeenCalledTimes(1)
    expect(ids(tree)).toEqual(['root', 'child'])

    tree.setExpandedKey('root', false)
    tree.setExpandedKey('root', true)
    tree.ensureLoaded(tree.getNode('root')!)
    expect(load).toHaveBeenCalledTimes(1)
    dispose()
  })

  it('пустой ответ делает ветку листом', () => {
    const { tree, dispose } = setup({
      data: [{ id: 'root', label: 'Корень' }],
      lazy: true,
      load: (_node: unknown, resolve: (children: Item[]) => void) => resolve([]),
    })

    tree.ensureLoaded(tree.getNode('root')!)

    expect(tree.isLeafNode(tree.getNode('root')!)).toBe(true)
    dispose()
  })
})

describe('useTree: текущий узел и перемещение', () => {
  it('текущий узел ведётся моделью', () => {
    const { tree, dispose } = setup()

    tree.setCurrentKey('billing')

    expect(tree.getCurrentKey()).toBe('billing')
    expect(tree.getCurrentNode()?.label).toBe('Биллинг')
    dispose()
  })

  it('узел переезжает внутрь другой ветки', () => {
    // Данные реактивные намеренно: `moveNode` перекладывает их на месте, и на
    // обычном массиве пересчитывать модель было бы нечему.
    const data = ref(nodes())
    const { tree, dispose } = setup({ data: () => data.value, defaultExpandedKeys: ['ops', 'billing'] })

    tree.moveNode(tree.getNode('esc')!, tree.getNode('billing')!, 'inner')

    expect(ids(tree)).toEqual(['ops', 'rules', 'billing', 'invoices', 'esc'])
    dispose()
  })

  it('узел нельзя перенести внутрь собственного потомка', () => {
    const { tree, dispose } = setup()

    expect(tree.canMoveNode(tree.getNode('ops')!, tree.getNode('duty')!, 'inner')).toBe(false)
    dispose()
  })
})
