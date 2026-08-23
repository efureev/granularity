import type { Component } from 'vue'

/**
 * Правила шагового мастера — чистая арифметика без Vue.
 *
 * Вынесено отдельным модулем и тестируется без монтирования: «можно ли уйти на
 * шаг N» и «какого он статуса» — вся содержательная логика компонента, и
 * проверять её через отрендеренный DOM было бы дороже и слабее (эталон —
 * `GrForm/validation.ts`).
 */

/**
 * Состояние шага.
 *
 * `error` не выводится из позиции — его ставит приложение, когда шаг пройден,
 * но не прошёл проверку. Без него мастер не умеет сказать «на втором шаге
 * остались ошибки», ради чего гейт перехода и заводится.
 */
export type GrStepStatus = 'complete' | 'current' | 'upcoming' | 'error'

export type GrStep = {
  value: string
  label: string
  /** Вторая строка под подписью: что от пользователя ждут на этом шаге. */
  description?: string
  /**
   * Иконка вместо номера — декоративна. Vue-компонент либо класс иконки вашей
   * UnoCSS-сборки (`i-lucide-*` требует вашего `presetIcons`).
   */
  icon?: string | Component
  /** Явный статус. Не задан — выводится из позиции относительно текущего шага. */
  status?: GrStepStatus
  disabled?: boolean
}

export function stepIndexOf(steps: readonly GrStep[], value: string): number {
  return steps.findIndex(step => step.value === value)
}

/**
 * Статус шага: явный побеждает позиционный.
 *
 * Позиция даёт три состояния из четырёх, и только `error` приходит снаружи —
 * вывести его неоткуда, ошибка живёт в форме, а не в порядке шагов.
 */
export function stepStatusAt(steps: readonly GrStep[], index: number, currentIndex: number): GrStepStatus {
  const explicit = steps[index]?.status
  if (explicit)
    return explicit

  if (index < currentIndex)
    return 'complete'
  if (index === currentIndex)
    return 'current'
  return 'upcoming'
}

/**
 * Можно ли уйти на шаг по его индексу.
 *
 * `linear` ограничивает **только движение вперёд**, и не одним шагом, а первым
 * непройденным: вернуться назад и снова прыгнуть на тот же шаг, до которого уже
 * дошёл, — нормальный сценарий правки заполненного мастера. Запрещать его
 * значило бы заставлять пользователя проходить всё заново ради одной опечатки.
 */
export function canEnterStep(options: {
  steps: readonly GrStep[]
  index: number
  currentIndex: number
  linear: boolean
}): boolean {
  const { steps, index, currentIndex, linear } = options
  const step = steps[index]

  if (!step || step.disabled)
    return false
  if (index === currentIndex)
    return false
  if (!linear || index < currentIndex)
    return true

  return index <= furthestReachableIndex(steps, currentIndex)
}

/**
 * Дальний край доступного в линейном режиме: текущий шаг плюс идущие за ним
 * подряд помеченные пройденными. Шаг с ошибкой краем не является — он и есть
 * причина, по которой дальше идти нельзя.
 */
function furthestReachableIndex(steps: readonly GrStep[], currentIndex: number): number {
  let furthest = currentIndex + 1

  for (let index = currentIndex + 1; index < steps.length; index += 1) {
    if (steps[index]?.status !== 'complete')
      break
    furthest = index + 1
  }

  return Math.min(furthest, steps.length - 1)
}

/** Индекс следующего доступного шага, или `-1`, если дальше идти некуда. */
export function nextEnterableIndex(steps: readonly GrStep[], currentIndex: number): number {
  for (let index = currentIndex + 1; index < steps.length; index += 1) {
    if (!steps[index]?.disabled)
      return index
  }

  return -1
}

/** Индекс предыдущего доступного шага, или `-1`. */
export function previousEnterableIndex(steps: readonly GrStep[], currentIndex: number): number {
  for (let index = currentIndex - 1; index >= 0; index -= 1) {
    if (!steps[index]?.disabled)
      return index
  }

  return -1
}
