import { describe, expect, it } from 'vitest'

import { applyTimeUnit, buildTimeColumns } from '../timeColumns'
import { plainTime } from '../plainTime'

function column(columns: ReturnType<typeof buildTimeColumns>, unit: string) {
  const found = columns.find(item => item.unit === unit)
  if (!found) throw new Error(`нет колонки ${unit}`)

  return found
}

function labels(columns: ReturnType<typeof buildTimeColumns>, unit: string): string[] {
  return column(columns, unit).options.map(option => option.label)
}

function disabled(columns: ReturnType<typeof buildTimeColumns>, unit: string): number[] {
  return column(columns, unit).options.filter(option => option.disabled).map(option => option.value)
}

describe('состав колонок', () => {
  it('24-часовой вид: часы 00..23, минуты по шагу, без периода', () => {
    const columns = buildTimeColumns({ value: plainTime(9, 30), minuteStep: 15 })

    expect(columns.map(item => item.unit)).toEqual(['hour', 'minute'])
    expect(labels(columns, 'hour')).toHaveLength(24)
    expect(labels(columns, 'hour')[0]).toBe('00')
    expect(labels(columns, 'minute')).toEqual(['00', '15', '30', '45'])
  })

  it('12-часовой вид: часы 01..12 плюс колонка периода', () => {
    const columns = buildTimeColumns({ value: plainTime(15, 0), twelveHour: true, periodLabels: ['AM', 'PM'] })

    expect(columns.map(item => item.unit)).toEqual(['hour', 'minute', 'period'])
    expect(labels(columns, 'hour')).toHaveLength(12)
    expect(labels(columns, 'hour')[0]).toBe('01')
    expect(labels(columns, 'period')).toEqual(['AM', 'PM'])
  })

  it('секунды появляются только по требованию', () => {
    expect(buildTimeColumns({ value: null }).map(item => item.unit)).toEqual(['hour', 'minute'])
    expect(buildTimeColumns({ value: null, enableSeconds: true, secondStep: 30 }).map(item => item.unit))
      .toEqual(['hour', 'minute', 'second'])
    expect(labels(buildTimeColumns({ value: null, enableSeconds: true, secondStep: 30 }), 'second'))
      .toEqual(['00', '30'])
  })

  it('нулевой и дробный шаг не подвешивают перебор', () => {
    // Шаг 0 дал бы бесконечный цикл, дробный — «минуту 0.5».
    expect(labels(buildTimeColumns({ value: null, minuteStep: 0 }), 'minute')).toHaveLength(60)
    expect(labels(buildTimeColumns({ value: null, minuteStep: 2.7 }), 'minute')).toHaveLength(30)
  })
})

describe('выбранная опция', () => {
  it('без значения не выбрана ни одна колонка', () => {
    const columns = buildTimeColumns({ value: null, twelveHour: true, enableSeconds: true })

    expect(columns.map(item => item.selectedIndex)).toEqual([-1, -1, -1, -1])
  })

  it('в 12-часовом виде 15:45 — это 03, 45 и PM', () => {
    const columns = buildTimeColumns({ value: plainTime(15, 45), twelveHour: true, periodLabels: ['AM', 'PM'] })

    expect(column(columns, 'hour').options[column(columns, 'hour').selectedIndex]?.label).toBe('03')
    expect(column(columns, 'minute').options[column(columns, 'minute').selectedIndex]?.label).toBe('45')
    expect(column(columns, 'period').selectedIndex).toBe(1)
  })

  it('полночь в 12-часовом виде — это 12 AM, а не 00', () => {
    const columns = buildTimeColumns({ value: plainTime(0, 0), twelveHour: true, periodLabels: ['AM', 'PM'] })
    const hours = column(columns, 'hour')

    expect(hours.options[hours.selectedIndex]?.label).toBe('12')
    expect(column(columns, 'period').selectedIndex).toBe(0)
  })

  it('значение вне шага не выбрано, но и не ломает колонку', () => {
    // 09:07 при шаге 15: подсветить нечего, список остаётся полным.
    const columns = buildTimeColumns({ value: plainTime(9, 7), minuteStep: 15 })

    expect(column(columns, 'minute').selectedIndex).toBe(-1)
    expect(labels(columns, 'minute')).toHaveLength(4)
  })
})

describe('границы min и max', () => {
  it('час остаётся доступен, если в него попадает хоть одна минута', () => {
    const columns = buildTimeColumns({ value: plainTime(10, 0), min: plainTime(9, 30) })

    // 09:30 попадает в девятый час — сам час запрещать нельзя.
    expect(disabled(columns, 'hour')).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('минуты до min в его же часе запрещены', () => {
    const columns = buildTimeColumns({ value: plainTime(9, 45), min: plainTime(9, 30), minuteStep: 15 })

    expect(disabled(columns, 'minute')).toEqual([0, 15])
  })

  it('max отсекает верх симметрично', () => {
    const columns = buildTimeColumns({ value: plainTime(17, 0), max: plainTime(17, 30), minuteStep: 15 })

    expect(disabled(columns, 'hour')).toEqual([18, 19, 20, 21, 22, 23])
    expect(disabled(columns, 'minute')).toEqual([45])
  })

  it('секунды сверяются точно, а не отрезком', () => {
    const columns = buildTimeColumns({
      value: plainTime(9, 30, 0),
      min: plainTime(9, 30, 30),
      enableSeconds: true,
      secondStep: 15,
    })

    expect(disabled(columns, 'second')).toEqual([0, 15])
  })

  it('период выключается целиком, если в нём нет ни одного допустимого часа', () => {
    const columns = buildTimeColumns({
      value: plainTime(13, 0),
      min: plainTime(12, 0),
      twelveHour: true,
      periodLabels: ['AM', 'PM'],
    })

    expect(disabled(columns, 'period')).toEqual([0])
  })

  it('в 12-часовом виде запрет часа считается по текущему периоду', () => {
    // 15:00 — период PM, значит «03» это 15:00 и он разрешён, а «01» (13:00) — нет.
    const columns = buildTimeColumns({
      value: plainTime(15, 0),
      min: plainTime(14, 0),
      twelveHour: true,
      periodLabels: ['AM', 'PM'],
    })

    expect(disabled(columns, 'hour')).toEqual([1, 12])
  })
})

describe('применение выбора', () => {
  it('минуты и секунды подставляются как есть', () => {
    expect(applyTimeUnit(plainTime(9, 30, 15), 'minute', 45)).toEqual(plainTime(9, 45, 15))
    expect(applyTimeUnit(plainTime(9, 30, 15), 'second', 0)).toEqual(plainTime(9, 30, 0))
  })

  it('час 24-часовой колонки подставляется напрямую', () => {
    expect(applyTimeUnit(plainTime(9, 30), 'hour', 21)).toEqual(plainTime(21, 30))
  })

  it('час 12-часовой колонки переводится по текущему периоду', () => {
    expect(applyTimeUnit(plainTime(15, 30), 'hour', 3, true)).toEqual(plainTime(15, 30))
    expect(applyTimeUnit(plainTime(9, 30), 'hour', 3, true)).toEqual(plainTime(3, 30))
    // 12 PM — это полдень, а не полночь.
    expect(applyTimeUnit(plainTime(15, 30), 'hour', 12, true)).toEqual(plainTime(12, 30))
    expect(applyTimeUnit(plainTime(9, 30), 'hour', 12, true)).toEqual(plainTime(0, 30))
  })

  it('смена периода двигает час на половину суток и обратно', () => {
    expect(applyTimeUnit(plainTime(9, 30), 'period', 1)).toEqual(plainTime(21, 30))
    expect(applyTimeUnit(plainTime(21, 30), 'period', 0)).toEqual(plainTime(9, 30))
    // Полночь и полдень — крайний случай, на котором ломается наивное ±12.
    expect(applyTimeUnit(plainTime(0, 0), 'period', 1)).toEqual(plainTime(12, 0))
    expect(applyTimeUnit(plainTime(12, 0), 'period', 0)).toEqual(plainTime(0, 0))
  })
})
