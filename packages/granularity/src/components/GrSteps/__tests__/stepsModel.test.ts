import { describe, expect, it } from 'vitest'

import type { GrStep } from '../stepsModel'
import {
  canEnterStep,
  nextEnterableIndex,
  previousEnterableIndex,
  stepIndexOf,
  stepStatusAt,
} from '../stepsModel'

/**
 * Правила перехода — вся содержательная логика мастера, и проверяются они без
 * монтирования: через отрендеренный DOM то же самое стоило бы дороже и
 * проверяло бы слабее.
 */
const steps: GrStep[] = [
  { value: 'cart', label: 'Корзина' },
  { value: 'delivery', label: 'Доставка' },
  { value: 'payment', label: 'Оплата' },
  { value: 'done', label: 'Готово' },
]

describe('stepStatusAt', () => {
  it('выводит статус из позиции относительно текущего', () => {
    expect(stepStatusAt(steps, 0, 1)).toBe('complete')
    expect(stepStatusAt(steps, 1, 1)).toBe('current')
    expect(stepStatusAt(steps, 2, 1)).toBe('upcoming')
  })

  /**
   * `error` неоткуда вывести: ошибка живёт в форме, а не в порядке шагов.
   * Поэтому явный статус всегда сильнее позиционного — иначе шаг с ошибкой,
   * оставшийся позади, снова выглядел бы пройденным.
   */
  it('явный статус побеждает позиционный', () => {
    const withError: GrStep[] = [{ ...steps[0], status: 'error' }, ...steps.slice(1)]

    expect(stepStatusAt(withError, 0, 2)).toBe('error')
    expect(stepStatusAt(steps, 0, 2)).toBe('complete')
  })
})

describe('canEnterStep', () => {
  const linear = (index: number, currentIndex: number) =>
    canEnterStep({ steps, index, currentIndex, linear: true })

  it('назад пускает всегда', () => {
    expect(linear(0, 2)).toBe(true)
    expect(linear(1, 2)).toBe(true)
  })

  it('вперёд — только на следующий', () => {
    expect(linear(2, 1)).toBe(true)
    expect(linear(3, 1)).toBe(false)
  })

  /**
   * Вернуться назад и снова прыгнуть на уже пройденный шаг — обычная правка
   * заполненного мастера. Запрет заставлял бы проходить всё заново ради одной
   * опечатки, поэтому край доступного тянется по подряд пройденным.
   */
  it('пройденные шаги впереди остаются достижимыми', () => {
    const visited: GrStep[] = [
      steps[0],
      steps[1],
      { ...steps[2], status: 'complete' },
      steps[3],
    ]

    expect(canEnterStep({ steps: visited, index: 3, currentIndex: 1, linear: true })).toBe(true)
  })

  it('шаг с ошибкой краем не является — дальше него не пускает', () => {
    const broken: GrStep[] = [steps[0], steps[1], { ...steps[2], status: 'error' }, steps[3]]

    expect(canEnterStep({ steps: broken, index: 2, currentIndex: 1, linear: true })).toBe(true)
    expect(canEnterStep({ steps: broken, index: 3, currentIndex: 1, linear: true })).toBe(false)
  })

  it('без linear вперёд пускает куда угодно', () => {
    expect(canEnterStep({ steps, index: 3, currentIndex: 0, linear: false })).toBe(true)
  })

  it('выключенный шаг и текущий недостижимы в любом режиме', () => {
    const disabled: GrStep[] = [steps[0], { ...steps[1], disabled: true }, ...steps.slice(2)]

    expect(canEnterStep({ steps: disabled, index: 1, currentIndex: 0, linear: false })).toBe(false)
    expect(canEnterStep({ steps, index: 1, currentIndex: 1, linear: false })).toBe(false)
  })
})

describe('соседние шаги', () => {
  it('next и previous перешагивают выключенные', () => {
    const disabled: GrStep[] = [steps[0], { ...steps[1], disabled: true }, ...steps.slice(2)]

    expect(nextEnterableIndex(disabled, 0)).toBe(2)
    expect(previousEnterableIndex(disabled, 2)).toBe(0)
  })

  it('на краях возвращают -1', () => {
    expect(previousEnterableIndex(steps, 0)).toBe(-1)
    expect(nextEnterableIndex(steps, steps.length - 1)).toBe(-1)
  })
})

describe('stepIndexOf', () => {
  it('неизвестное значение даёт -1, а не первый шаг', () => {
    expect(stepIndexOf(steps, 'payment')).toBe(2)
    expect(stepIndexOf(steps, 'nope')).toBe(-1)
  })
})
