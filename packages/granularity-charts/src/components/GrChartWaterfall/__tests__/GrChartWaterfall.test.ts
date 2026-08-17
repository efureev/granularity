import { announced, granularityGlobal, keydown, mockRect } from '@feugene/granularity/testing'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import GrChartWaterfall from '../GrChartWaterfall.vue'

const steps = [
  { label: 'На начало', value: 500, kind: 'total' as const },
  { label: 'Новые', value: 120 },
  { label: 'Отток', value: -45 },
  { label: 'Заморожены', value: 0 },
]

function factory(props: Record<string, unknown> = {}, options: Record<string, unknown> = {}) {
  const wrapper = mount(GrChartWaterfall, {
    props: { steps, ...props },
    global: granularityGlobal(options),
    attachTo: document.body,
  })

  const surface = wrapper.find('[data-gr-chart-surface]')

  if (surface.exists())
    mockRect(surface.element, { left: 0, top: 0, width: 640, height: 256 })

  return wrapper
}

function bars(wrapper: ReturnType<typeof factory>) {
  return wrapper.findAll('[data-gr-chart-waterfall-step]')
}

function cells(wrapper: ReturnType<typeof factory>) {
  return wrapper.findAll('[data-gr-chart-table] tbody tr').map(row => [
    row.find('th').text(),
    ...row.findAll('td').map(cell => cell.text()),
  ])
}

describe('GrChartWaterfall', () => {
  it('рисует столбец на каждый ненулевой шаг', () => {
    expect(bars(factory())).toHaveLength(3)
  })

  it('нулевой шаг — черта, а не пустота', () => {
    // «Движения не было» это факт: пустое место читалось бы как «шага нет».
    const wrapper = factory()

    expect(wrapper.findAll('[data-gr-chart-waterfall-zero]')).toHaveLength(1)
    expect(wrapper.find('[data-gr-chart-waterfall-zero]').attributes('stroke-width'))
      .toContain('--gr-chart-waterfall-zero-step')
  })

  it('цвет идёт по знаку шага, а не по индексу серии', () => {
    const fills = bars(factory()).map(node => node.attributes('fill'))

    expect(fills[0]).toContain('--gr-chart-1')
    expect(fills[1]).toContain('--gr-success')
    expect(fills[2]).toContain('--gr-danger')
  })

  it('явный цвет шага сильнее знака', () => {
    const wrapper = factory({ steps: [{ label: 'Прирост', value: 10, color: 'var(--gr-warning)' }] })

    expect(bars(wrapper)[0]!.attributes('fill')).toBe('var(--gr-warning)')
  })

  it('соединитель к шагу `total` не ведёт', () => {
    // Он не продолжает накопление, а объявляет его.
    const wrapper = factory({
      steps: [{ label: 'Начислено', value: 120 }, { label: 'На конец', value: 620, kind: 'total' }],
    })

    expect(wrapper.findAll('[data-gr-chart-waterfall-connector]')).toHaveLength(0)
  })

  it('соединители выключаются пропом', () => {
    expect(factory().findAll('[data-gr-chart-waterfall-connector]').length).toBeGreaterThan(0)
    expect(factory({ showConnectors: false }).findAll('[data-gr-chart-waterfall-connector]')).toHaveLength(0)
  })

  it('соединители рисуются раньше столбцов — иначе они легли бы поверх полос', () => {
    const wrapper = factory()
    const body = wrapper.find('[data-gr-chart-waterfall-body]').element
    const connectors = wrapper.find('[data-gr-chart-waterfall-connectors]').element

    expect(connectors.compareDocumentPosition(body) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('`showTotal` дорисовывает столбец, не меняя накопления', () => {
    const withTotal = factory({ showTotal: true })

    expect(bars(withTotal)).toHaveLength(4)
    expect(cells(withTotal).at(-1)).toEqual(['Total', '575', '575', '575'])
  })

  it('подпись итога задаётся строкой', () => {
    expect(cells(factory({ showTotal: 'Баланс' })).at(-1)![0]).toBe('Баланс')
  })

  it('скрытая таблица несёт накопление до и после, а не одну дельту', () => {
    // По одной дельте мост не восстановить: высоту столбца задаёт накопление.
    expect(cells(factory())).toEqual([
      ['На начало', '500', '0', '500'],
      ['Новые', '120', '500', '620'],
      ['Отток', '-45', '620', '575'],
      ['Заморожены', '0', '575', '575'],
    ])
  })

  it('одинаковые подписи шагов не сдвигают курсор', () => {
    // Категорией становится индекс, а не подпись: нормализация схлопнула бы
    // повторы, и позиций стало бы меньше, чем шагов.
    const wrapper = factory({
      steps: [
        { label: 'Корректировка', value: 10 },
        { label: 'Корректировка', value: -4 },
        { label: 'Прирост', value: 7 },
      ],
    })

    expect(bars(wrapper)).toHaveLength(3)
    expect(cells(wrapper)).toHaveLength(3)
  })

  it('ось шагов подписана именами, а не индексами', () => {
    const labels = factory().findAll('[data-gr-chart-axis="x"] text').map(node => node.text())

    expect(labels).toContain('Новые')
  })

  it('ось значений включает ноль', () => {
    const labels = factory().findAll('[data-gr-chart-axis="y"] text').map(node => node.text())

    expect(labels).toContain('0')
  })

  it('клавиатура объявляет шаг вместе с накоплением', async () => {
    const wrapper = factory()

    keydown(wrapper.find('[data-gr-chart-surface]').element, 'ArrowRight')
    await nextTick()

    // По одной дельте мост не восстановить на слух — накопление обязательно.
    await expect(announced()).resolves.toContain('На начало')
    await expect(announced()).resolves.toContain('500')
  })

  it('пустой список шагов даёт пустое состояние, а не деление на ноль', () => {
    const wrapper = factory({ steps: [] })

    expect(bars(wrapper)).toHaveLength(0)
    expect(wrapper.find('[data-gr-chart-surface]').exists()).toBe(false)
  })

  it('высота холста берётся из пропа', () => {
    expect(factory({ height: 120 }).find('svg').attributes('height')).toBe('120')
  })
})

describe('GrChartWaterfall: горизонталь', () => {
  it('оси рисует сам компонент, а не рама', () => {
    // Ось значений рамы вертикальна по построению, а здесь она внизу.
    const wrapper = factory({ orientation: 'horizontal' })

    expect(wrapper.findAll('[data-gr-chart-axis]')).toHaveLength(2)
    expect(wrapper.findAll('[data-gr-chart-axis="y"] text').map(node => node.text())).toContain('Новые')
  })

  it('столбцы растут вдоль горизонтали', () => {
    const vertical = bars(factory())[1]!.attributes('d')!
    const horizontal = bars(factory({ orientation: 'horizontal' }))[1]!.attributes('d')!

    expect(horizontal).not.toBe(vertical)
  })

  it('таблица и накопления от ориентации не зависят', () => {
    expect(cells(factory({ orientation: 'horizontal' }))).toEqual(cells(factory()))
  })

  it('сетка идёт по оси значений, то есть вертикальными линиями', () => {
    const wrapper = factory({ orientation: 'horizontal', showGrid: 'y' })
    const lines = wrapper.findAll('[data-gr-chart-grid] line')

    expect(lines.length).toBeGreaterThan(0)
    // Вертикальная линия: абсциссы концов совпадают, ординаты — нет.
    expect(lines[0]!.attributes('x1')).toBe(lines[0]!.attributes('x2'))
    expect(lines[0]!.attributes('y1')).not.toBe(lines[0]!.attributes('y2'))
  })
})
