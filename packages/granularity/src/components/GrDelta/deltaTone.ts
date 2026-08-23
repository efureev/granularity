/**
 * Выбор тона для величины со знаком.
 *
 * Чистая функция, а не `switch` внутри компонента: ровно этот `switch`
 * расходился по приложениям копиями, и в одной из них нулевое движение
 * красилось зелёным — как поступление.
 */

/** Что считать хорошим ростом. */
export type GrDeltaPolarity
  /** Рост — успех: выручка, конверсия, число подписок. */
  = | 'positive-good'
  /** Рост — проблема: себестоимость, время отклика, отток. */
    | 'negative-good'
  /** Знак ничего не говорит о качестве: сальдо, смещение, разница координат. */
    | 'none'

export type GrDeltaTone = 'success' | 'danger' | 'neutral'

/**
 * Тон величины по её знаку и полярности.
 *
 * Ноль нейтрален при любой полярности: «не изменилось» — третье состояние, и
 * двумя цветами его не выразить. `null` величины нет вовсе — тона у неё тоже
 * нет, это решает вызывающий.
 */
export function deltaTone(value: number, polarity: GrDeltaPolarity = 'positive-good'): GrDeltaTone {
  if (polarity === 'none' || value === 0 || Number.isNaN(value))
    return 'neutral'

  const good = polarity === 'positive-good' ? value > 0 : value < 0

  return good ? 'success' : 'danger'
}

/** Направление стрелки. Ноль стрелки не получает: двигаться было некуда. */
export function deltaDirection(value: number): 'up' | 'down' | 'flat' {
  if (Number.isNaN(value) || value === 0)
    return 'flat'
  return value > 0 ? 'up' : 'down'
}
