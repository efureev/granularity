import { announced, granularityGlobal, keydown, mockRect } from '@feugene/granularity/testing'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import { estimateTextWidth } from '../../../chart/chartLayout'
import GrChartFunnel from '../GrChartFunnel.vue'

const stages = [
  { label: 'Зарегистрировались', value: 1000 },
  { label: 'Активировали', value: 400 },
  { label: 'Оплатили', value: 120 },
]

function factory(props: Record<string, unknown> = {}, options: Record<string, unknown> = {}) {
  const wrapper = mount(GrChartFunnel, {
    props: { stages, ...props },
    global: granularityGlobal(options),
    attachTo: document.body,
  })

  const surface = wrapper.find('[data-gr-chart-surface]')

  if (surface.exists())
    mockRect(surface.element, { left: 0, top: 0, width: 640, height: 256 })

  return wrapper
}

function steps(wrapper: ReturnType<typeof factory>) {
  return wrapper.findAll('[data-gr-chart-funnel-stage]')
}

function rows(wrapper: ReturnType<typeof factory>) {
  return wrapper.findAll('[data-gr-chart-table] tbody tr').map(row => [
    row.find('th').text(),
    ...row.findAll('td').map(cell => cell.text()),
  ])
}

describe('GrChartFunnel', () => {
  it('рисует ступень на каждый этап', () => {
    expect(steps(factory())).toHaveLength(3)
  })

  it('таблица несёт обе доли отдельными колонками', () => {
    // Смешать их значило бы соврать: «сорок процентов» от первой и от
    // предыдущей — разные числа.
    const head = factory().findAll('[data-gr-chart-table] thead th').map(node => node.text())

    expect(head).toEqual(['Step', 'Value', 'Share of first', 'Share of previous'])
    expect(rows(factory())).toEqual([
      ['Зарегистрировались', '1,000', '100%', '—'],
      ['Активировали', '400', '40%', '40%'],
      ['Оплатили', '120', '12%', '30%'],
    ])
  })

  it('нулевая ступень остаётся видимой', () => {
    const wrapper = factory({ stages: [{ label: 'A', value: 100 }, { label: 'Б', value: 0 }] })

    expect(steps(wrapper)).toHaveLength(2)
    expect(steps(wrapper)[1]!.attributes('d')).not.toContain('NaN')
  })

  it('рост между ступенями отражён в описании, а не выпрямлен', () => {
    const wrapper = factory({ stages: [{ label: 'A', value: 100 }, { label: 'Б', value: 150 }] })

    expect(wrapper.find('[data-gr-chart-surface]').attributes('aria-description')).toContain('Б')
  })

  it('без роста описание не выдумывается', () => {
    expect(factory().find('[data-gr-chart-surface]').attributes('aria-description')).toBeUndefined()
  })

  it('`shape: bar` и `trapezoid` дают одинаковые значения в таблице', () => {
    expect(rows(factory({ shape: 'bar' }))).toEqual(rows(factory({ shape: 'trapezoid' })))
  })

  it('форма ступени всё же меняется', () => {
    expect(steps(factory({ shape: 'bar' }))[0]!.attributes('d'))
      .not
      .toBe(steps(factory({ shape: 'trapezoid' }))[0]!.attributes('d'))
  })

  it('подпись ступени переключается между значением и долями', () => {
    const label = (labels: string) => factory({ labels }).find('[data-gr-chart-funnel-label="1"]').text()

    expect(label('value')).toBe('400')
    expect(label('share-first')).toBe('40%')
    expect(label('share-prev')).toBe('40%')
    expect(factory({ labels: 'none' }).findAll('[data-gr-chart-funnel-label]')).toHaveLength(0)
  })

  it('одинаковые подписи ступеней не схлопываются в одну позицию', () => {
    const wrapper = factory({
      stages: [{ label: 'Шаг', value: 10 }, { label: 'Шаг', value: 5 }],
    })

    expect(steps(wrapper)).toHaveLength(2)
    expect(rows(wrapper)).toHaveLength(2)
  })

  it('`↑↓` ведут по ступеням так же, как `←→`: воронка идёт одной колонкой', async () => {
    const wrapper = factory()
    const element = wrapper.find('[data-gr-chart-surface]').element

    keydown(element, 'ArrowDown')
    await nextTick()
    await expect(announced()).resolves.toContain('Зарегистрировались')

    keydown(element, 'ArrowDown')
    await nextTick()
    await expect(announced()).resolves.toContain('Активировали')

    keydown(element, 'ArrowUp')
    await nextTick()
    await expect(announced()).resolves.toContain('Зарегистрировались')
  })

  it('объявление ступени несёт обе доли', async () => {
    const wrapper = factory()

    keydown(wrapper.find('[data-gr-chart-surface]').element, 'End')
    await nextTick()

    await expect(announced()).resolves.toContain('12%')
    await expect(announced()).resolves.toContain('30%')
  })

  it('горизонталь меняет направление ступеней', () => {
    expect(steps(factory({ orientation: 'horizontal' }))[0]!.attributes('d'))
      .not
      .toBe(steps(factory())[0]!.attributes('d'))
  })

  it('пустой список ступеней даёт пустое состояние', () => {
    const wrapper = factory({ stages: [] })

    expect(steps(wrapper)).toHaveLength(0)
    expect(wrapper.find('[data-gr-chart-surface]').exists()).toBe(false)
  })
})

describe('GrChartFunnel: подписи в ступени', () => {
  it('подпись, которая шире ступени, стоит рядом с ней, а не поверх фона', () => {
    // Узкая ступень — то место, где воронка теряет больше всего: подпись там
    // нужнее всего. Внутри она вылезла бы на фон и читалась как чужая.
    const wrapper = factory({
      stages: [{ label: 'Много', value: 100000 }, { label: 'Мало', value: 40 }],
    })
    const inside = wrapper.get('[data-gr-chart-funnel-label="0"]')
    const outside = wrapper.get('[data-gr-chart-funnel-label="1"]')

    expect(inside.attributes('data-outside')).toBeUndefined()
    expect(outside.attributes('data-outside')).toBe('')
    expect(outside.text()).toBe('40')
    expect(outside.attributes('text-anchor')).toBe('start')
  })

  it('на широкой ступени подпись остаётся внутри', () => {
    const wrapper = factory({ stages: [{ label: 'Одна', value: 100 }] })

    expect(wrapper.get('[data-gr-chart-funnel-label="0"]').attributes('data-outside')).toBeUndefined()
  })

  it.each(['vertical', 'horizontal'])('у каждой ступени есть подпись значения (%s)', (orientation) => {
    const trial = factory({
      orientation,
      labels: 'share-first',
      stages: [
        { label: 'Visited pricing', value: 12400 },
        { label: 'Started a trial', value: 3180 },
        { label: 'Activated', value: 1420 },
        { label: 'Paid', value: 612 },
      ],
    })

    expect(trial.findAll('[data-gr-chart-funnel-label]').map(node => node.text())).toEqual(['100%', '26%', '11%', '5%'])
  })

  it.each(['vertical', 'horizontal'])('нулевая ступень подписана «0» (%s)', (orientation) => {
    const referral = factory({
      orientation,
      labels: 'value',
      stages: [
        { label: 'Invited', value: 940 },
        { label: 'Opened', value: 1360 },
        { label: 'Signed up', value: 410 },
        { label: 'Paid', value: 0 },
      ],
    })

    expect(referral.findAll('[data-gr-chart-funnel-label]').map(node => node.text())).toEqual(['940', '1,360', '410', '0'])
  })
})

describe('GrChartFunnel: имена ступеней', () => {
  const stages = [
    { label: 'Visited pricing', value: 1000 },
    { label: 'Started a trial', value: 400 },
    { label: 'Paid', value: 120 },
  ]

  function names(wrapper: ReturnType<typeof factory>): string[] {
    return wrapper.findAll('[data-gr-chart-funnel-name]').map(node => node.element.childNodes[0]!.textContent!.trim())
  }

  it('вертикаль: имена колонкой слева от ступеней', () => {
    const wrapper = factory({ stages })
    const firstStage = wrapper.get('[data-gr-chart-funnel-stage="0"]').attributes('d')!
    const stageLeft = Number(firstStage.split(' ')[1])
    const name = wrapper.get('[data-gr-chart-funnel-name="0"]')

    expect(names(wrapper)).toEqual(stages.map(stage => stage.label))
    expect(name.attributes('text-anchor')).toBe('end')
    expect(Number(name.attributes('x'))).toBeLessThanOrEqual(stageLeft)
    expect(Number(name.attributes('x')) - estimateTextWidth('Visited pricing', 12)).toBeGreaterThanOrEqual(0)
  })

  it('горизонталь: имена строкой под ступенями', () => {
    const wrapper = factory({ stages, orientation: 'horizontal' })
    const name = wrapper.get('[data-gr-chart-funnel-name="1"]')
    const label = wrapper.get('[data-gr-chart-funnel-label="1"]')

    expect(names(wrapper)).toEqual(stages.map(stage => stage.label))
    expect(name.attributes('text-anchor')).toBe('middle')
    expect(Number(name.attributes('y'))).toBeGreaterThan(Number(label.attributes('y')))
  })

  it('имя шире потолка кончается многоточием, полное — в title', () => {
    const long = 'Открыли письмо с приглашением и перешли по ссылке на страницу тарифов'
    const wrapper = factory({ stages: [{ label: long, value: 10 }, { label: 'Оплатили', value: 2 }], width: 400 })
    const name = wrapper.get('[data-gr-chart-funnel-name="0"]')

    expect(name.element.childNodes[0]!.textContent!.trim().endsWith('…')).toBe(true)
    expect(name.find('title').text()).toBe(long)
  })

  it('без ступеней имён нет', () => {
    expect(factory({ stages: [] }).findAll('[data-gr-chart-funnel-name]')).toHaveLength(0)
  })
})
