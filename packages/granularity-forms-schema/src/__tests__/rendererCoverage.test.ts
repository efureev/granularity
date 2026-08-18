import { describe, expect, it } from 'vitest'

import type { GrSchemaKind, GrSchemaNode } from '../model'
import { coreRenderers, createSchemaRendererRegistry } from '../renderers'
import { extendedRenderers } from '../renderers/extended'

/**
 * Гейт покрытия реестра.
 *
 * Дефект, ради которого написан: узел, которому не нашлось записи, рисуется
 * текстовым полем — форма выглядит рабочей и молча теряет тип значения. Ошибка
 * всплывает у потребителя на его схеме, а не у нас.
 */
function node(kind: GrSchemaKind, extra: Partial<GrSchemaNode> = {}): GrSchemaNode {
  return {
    path: 'x',
    key: 'x',
    kind,
    required: false,
    nullable: false,
    readOnly: false,
    writeOnly: false,
    deprecated: false,
    constraints: {},
    residual: false,
    ...extra,
  } as GrSchemaNode
}

const registry = createSchemaRendererRegistry(coreRenderers)

describe('дефолтный набор покрывает виды значений', () => {
  const cases: [string, GrSchemaNode][] = [
    ['строка', node('string')],
    ['почта', node('string', { format: 'email' })],
    ['ссылка', node('string', { format: 'url' })],
    ['телефон', node('string', { format: 'tel' })],
    ['пароль', node('string', { format: 'password' })],
    ['длинный текст', node('string', { constraints: { max: 500 } })],
    ['число', node('number')],
    ['булев', node('boolean')],
    ['выбор из немногих', node('string', { options: [{ value: 'a', label: 'a' }] })],
    ['выбор из многих', node('string', { options: Array.from({ length: 20 }, (_, i) => ({ value: `v${i}`, label: `v${i}` })) })],
    ['файл', node('file')],
    ['массив строк', node('array', { item: node('string') })],
    ['массив файлов', node('array', { item: node('file') })],
    ['массив вариантов', node('array', { item: node('string', { options: [{ value: 'a', label: 'a' }] }) })],
    ['неразобранный узел', node('unknown')],
  ]

  it.each(cases)('%s находит свой контрол', (_label, item) => {
    expect(registry.resolve(item)).toBeDefined()
  })
})

describe('приоритеты', () => {
  it('точное совпадение по формату сильнее общего правила строки', () => {
    expect(registry.resolve(node('string', { format: 'email' }))?.name).toBe('gr:email')
    expect(registry.resolve(node('string'))?.name).toBe('gr:string')
  })

  it('немного вариантов — переключатели, много — список с поиском', () => {
    const few = node('string', { options: [{ value: 'a', label: 'a' }, { value: 'b', label: 'b' }] })
    const many = node('string', { options: Array.from({ length: 12 }, (_, i) => ({ value: `v${i}`, label: `v${i}` })) })

    expect(registry.resolve(few)?.name).toBe('gr:enum-radio')
    expect(registry.resolve(many)?.name).toBe('gr:enum-select')
  })

  it('длинная строка становится многострочным полем', () => {
    expect(registry.resolve(node('string', { constraints: { max: 500 } }))?.name).toBe('gr:textarea-long')
  })

  /** Потребитель регистрирует свою запись после и вправе ждать, что она победит. */
  it('своя запись сильнее дефолтной без указания приоритета', () => {
    const own = createSchemaRendererRegistry(coreRenderers)
      .register({ name: 'app:string', component: {}, when: { kind: 'string' } })

    expect(own.resolve(node('string'))?.name).toBe('app:string')
  })

  it('явно названный виджет игнорирует условия', () => {
    expect(registry.resolve(node('number'), 'gr:string')?.name).toBe('gr:string')
  })
})

describe('расширенный набор', () => {
  it('не пересекается с дефолтным по именам', () => {
    const core = new Set(coreRenderers.map(entry => entry.name))
    const clash = extendedRenderers.filter(entry => core.has(entry.name))

    expect(clash).toEqual([])
  })

  /** Каждая запись обязана назвать, что рисует: по этому списку считается selection. */
  it('каждая запись называет свои компоненты', () => {
    const silent = [...coreRenderers, ...extendedRenderers].filter(entry => !entry.components?.length)

    expect(silent.map(entry => entry.name)).toEqual([])
  })
})

describe('список зависимостей', () => {
  /**
   * Дескриптор объявляет зависимости отдельным списком строк — иначе его
   * загрузка в Node потянула бы SFC вместе с их CSS. Гейт держит два списка
   * в согласии: разойдись они, потребитель получил бы контрол без стилей.
   */
  it('совпадает с тем, что реально рисует дефолтный набор', async () => {
    const { CORE_RENDERER_COMPONENTS } = await import('../renderers/coreComponents')
    const { coreRendererComponents } = await import('../renderers/core')

    expect([...CORE_RENDERER_COMPONENTS].sort()).toEqual([...coreRendererComponents].sort())
  })
})
