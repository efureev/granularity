export { bigStep } from '../shared/numericStep'

/**
 * Экспоненциальная запись разбирается отдельно: `String(1e-7)` — это `"1e-7"`,
 * и поиск точки насчитал бы ноль знаков, после чего округление съело бы всё
 * значение.
 */
export function decimalsOf(value: number): number {
  if (!Number.isFinite(value))
    return 0

  const text = String(Math.abs(value))

  const exponential = text.match(/^\d+(?:\.(\d+))?e-(\d+)$/)
  if (exponential) {
    const [, fraction = '', exponent] = exponential
    return fraction.length + Number(exponent)
  }

  const dot = text.indexOf('.')
  return dot === -1 ? 0 : text.length - dot - 1
}

/**
 * Двоичная дробь копит ошибку, поэтому сумма округляется. Разрядность — по
 * большему из операндов: шаг `0.5` от значения `1.25` обязан дать `1.75`.
 */
export function addStep(current: number, step: number): number {
  const decimals = Math.max(decimalsOf(current), decimalsOf(step))
  const sum = current + step

  // `toFixed` за пределами 100 знаков бросает.
  return decimals > 100 ? sum : Number(sum.toFixed(decimals))
}
